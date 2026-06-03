import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProductInputSchema, normalizeProductList, normalizeProductRecord } from '@/lib/contracts/products'
import { isLegacyProductsSchemaError, LEGACY_PRODUCTS_SCHEMA_WARNING } from '@/lib/database/product-schema'
import { generateArtisticQR, generateVerificationURL } from '@/lib/qr-generator'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all products for the user
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({ products: normalizeProductList(products ?? []) })
  } catch (error) {
    console.error('Fetch products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = createProductInputSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid product payload' },
        { status: 400 }
      )
    }

    const {
      name,
      description,
      category,
      brand,
      imageUrl,
      industryId,
      workflow,
      story,
      features,
      authenticityFeatures,
      confidence,
    } = parsed.data

    // Generate unique Truemark ID
    const truemarkId = `TM-${crypto.randomBytes(8).toString('hex').toUpperCase()}`

    // Generate verification URL
    const verificationUrl = await generateVerificationURL(
      crypto.randomUUID(),
      truemarkId
    )

    // Generate artistic QR code based on industry
    const qrCodeDataUrl = await generateArtisticQR(verificationUrl, industryId || 'minimal')

    // Generate blockchain hash (simplified - in production use real blockchain)
    const blockchainTx = crypto
      .createHash('sha256')
      .update(`${truemarkId}-${Date.now()}`)
      .digest('hex')

    const baseInsert = {
      user_id: user.id,
      name,
      description: description ?? null,
      category: category ?? null,
      brand: brand ?? null,
      image_url: imageUrl ?? null,
      truemark_id: truemarkId,
      blockchain_tx_hash: blockchainTx,
      qr_code_url: qrCodeDataUrl,
      verification_url: verificationUrl,
    }

    const fullInsert = {
      ...baseInsert,
      industry_id: industryId ?? null,
      workflow: workflow ?? null,
      story: story ?? null,
      features: features ?? null,
      authenticity_features: authenticityFeatures ?? null,
      confidence: confidence ?? null,
    }

    // Create product with AI AutoFlow data
    let { data: product, error } = await supabase
      .from('products')
      .insert(fullInsert)
      .select()
      .single()

    let warning: string | undefined

    if (error && isLegacyProductsSchemaError(error)) {
      const fallbackResult = await supabase
        .from('products')
        .insert(baseInsert)
        .select()
        .single()

      product = fallbackResult.data
      error = fallbackResult.error
      warning = LEGACY_PRODUCTS_SCHEMA_WARNING
    }

    if (error) {
      console.error('Create product error:', error)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { product: normalizeProductRecord(product), warning },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
