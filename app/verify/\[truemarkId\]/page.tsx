import { createClient } from '@/lib/supabase/server'
import { Shield, CheckCircle, XCircle, MapPin, Calendar, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'

interface VerifyPageProps {
  params: {
    truemarkId: string
  }
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const supabase = await createClient()

  // Fetch product by Truemark ID
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('truemark_id', params.truemarkId)
    .single()

  if (error || !product) {
    notFound()
  }

  // Log scan (in production, do this via API to capture IP/location)
  await supabase.from('product_scans').insert({
    product_id: product.id,
    truemark_id: params.truemarkId,
    verified: true,
  })

  // Increment scan count
  await supabase
    .from('products')
    .update({
      scan_count: (product.scan_count || 0) + 1,
      last_scanned_at: new Date().toISOString()
    })
    .eq('id', product.id)

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Verification Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg">
            <CheckCircle className="h-6 w-6" />
            <span className="font-bold text-lg">VERIFIED AUTHENTIC</span>
          </div>
        </div>

        {/* Product Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200 dark:border-gray-800">
          {/* Product Image */}
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-64 object-cover rounded-xl"
            />
          )}

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.description && (
              <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
            )}
          </div>

          {/* Industry Badge */}
          {product.industry_id && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium capitalize">
                {product.industry_id.replace('-', ' & ')} Industry
              </span>
            </div>
          )}

          {/* AI Story */}
          {product.story && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-100 dark:border-yellow-900/30">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Product Journey
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{product.story}</p>
            </div>
          )}

          {/* Authenticity Features */}
          {product.authenticity_features && product.authenticity_features.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Verification Methods:</h2>
              <ul className="space-y-2">
                {product.authenticity_features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Blockchain Proof */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Truemark ID: <code className="font-mono">{product.truemark_id}</code></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Blockchain: <code className="font-mono text-xs">{product.blockchain_tx_hash?.slice(0, 16)}...</code></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Registered: {new Date(product.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* AR Experience Button (Future) */}
          <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
            🎭 View in Augmented Reality
          </button>
        </div>

        {/* Scan Stats */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          This product has been verified {product.scan_count || 1} time(s)
        </div>
      </div>
    </main>
  )
}
