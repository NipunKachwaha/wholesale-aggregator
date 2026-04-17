export const typeDefs = `#graphql

  # ── Scalar Types
  scalar DateTime
  scalar JSON

  # ── Product
  type Product {
    id:          ID!
    sku:         String!
    name:        String!
    category:    String
    basePrice:   Float
    unit:        String
    stockQty:    Int
    isActive:    Boolean
    vendor:      Vendor
    createdAt:   DateTime
    updatedAt:   DateTime
  }

  # ── Order
  type Order {
    id:          ID!
    status:      OrderStatus!
    lineItems:   [LineItem!]!
    totalAmount: Float
    buyer:       User
    notes:       String
    createdAt:   DateTime
    updatedAt:   DateTime
  }

  type LineItem {
    sku:       String!
    name:      String!
    quantity:  Int!
    unitPrice: Float!
    total:     Float!
  }

  enum OrderStatus {
    draft
    confirmed
    processing
    fulfilled
    cancelled
  }

  # ── Vendor
  type Vendor {
    id:               ID!
    name:             String!
    feedType:         String!
    reliabilityScore: Float
    isActive:         Boolean
    lastSyncedAt:     DateTime
    products:         [Product!]
  }

  # ── User
  type User {
    id:        ID!
    email:     String!
    firstName: String
    lastName:  String
    role:      String!
    tenantId:  String!
  }

  # ── Analytics
  type Analytics {
    totalOrders:    Int!
    totalRevenue:   Float!
    avgOrderValue:  Float!
    fulfilledOrders: Int!
    cancelledOrders: Int!
    topProducts:    [ProductStat!]!
  }

  type ProductStat {
    sku:      String!
    name:     String!
    quantity: Int!
    revenue:  Float!
  }

  # ── Pagination
  type ProductConnection {
    nodes:      [Product!]!
    total:      Int!
    page:       Int!
    totalPages: Int!
  }

  type OrderConnection {
    nodes:      [Order!]!
    total:      Int!
    page:       Int!
    totalPages: Int!
  }

  # ── Input Types
  input ProductFilter {
    search:      String
    category:    String
    minPrice:    Float
    maxPrice:    Float
    minStock:    Int
    isActive:    Boolean
  }

  input OrderFilter {
    status:    OrderStatus
    buyerId:   String
    dateFrom:  DateTime
    dateTo:    DateTime
  }

  input CreateOrderInput {
    lineItems: [LineItemInput!]!
    notes:     String
    tenantId:  String
  }

  input LineItemInput {
    sku:       String!
    quantity:  Int!
    unitPrice: Float!
  }

  input PaginationInput {
    page:  Int  = 1
    limit: Int  = 20
  }

  # ── Queries
  type Query {
    # Products
    products(
      filter:     ProductFilter
      pagination: PaginationInput
      tenantId:   String!
    ): ProductConnection!

    product(
      sku:      String!
      tenantId: String!
    ): Product

    # Orders
    orders(
      filter:     OrderFilter
      pagination: PaginationInput
      tenantId:   String!
    ): OrderConnection!

    order(
      id:       String!
      tenantId: String!
    ): Order

    # Vendors
    vendors(tenantId: String!): [Vendor!]!

    vendor(
      id:       String!
      tenantId: String!
    ): Vendor

    # Analytics
    analytics(
      tenantId: String!
      days:     Int = 30
    ): Analytics!

    # Health
    health: String!
  }

  # ── Mutations
  type Mutation {
    createOrder(
      input:    CreateOrderInput!
      tenantId: String!
    ): Order!

    updateOrderStatus(
      id:       String!
      status:   OrderStatus!
      tenantId: String!
    ): Order!

    cancelOrder(
      id:       String!
      tenantId: String!
    ): Order!
  }

  # ── Subscriptions
  type Subscription {
    orderCreated(tenantId: String!):       Order!
    orderStatusChanged(tenantId: String!): Order!
    stockAlert(tenantId: String!):         Product!
  }
`