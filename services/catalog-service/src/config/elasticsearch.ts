import { Client } from '@elastic/elasticsearch'

export const esClient = new Client({
  node: process.env.ES_URL || 'http://localhost:9200',
})

// ── Index names
export const INDICES = {
  PRODUCTS: 'wholesale_products',
  ORDERS:   'wholesale_orders',
  VENDORS:  'wholesale_vendors',
}

// ── Product index create karo
export const createProductIndex = async (): Promise<void> => {
  try {
    const exists = await esClient.indices.exists({
      index: INDICES.PRODUCTS
    })

    if (!exists) {
      await esClient.indices.create({
        index: INDICES.PRODUCTS,
        body: {
          settings: {
            number_of_shards:   1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                product_analyzer: {
                  type:      'custom',
                  tokenizer: 'standard',
                  filter:    ['lowercase', 'asciifolding', 'stop'],
                },
              },
            },
          },
          mappings: {
            properties: {
              tenantId:   { type: 'keyword' },
              vendorId:   { type: 'keyword' },
              sku:        { type: 'keyword'  },
              name: {
                type:     'text',
                analyzer: 'product_analyzer',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              category: {
                type:   'text',
                fields: { keyword: { type: 'keyword' } }
              },
              basePrice:  { type: 'float'   },
              unit:       { type: 'keyword' },
              stockQty:   { type: 'integer' },
              isActive:   { type: 'boolean' },
              syncedAt:   { type: 'date'    },
              attributes: { type: 'object', dynamic: true },
            },
          },
        },
      })
      console.log('✅ Elasticsearch product index created')
    }
  } catch (error: any) {
    console.error('❌ ES index creation failed:', error.message)
  }
}

// ── Test connection
export const testEsConnection = async (): Promise<boolean> => {
  try {
    await esClient.ping()
    console.log('✅ Elasticsearch connected')
    return true
  } catch {
    console.warn('⚠️  Elasticsearch not available')
    return false
  }
}