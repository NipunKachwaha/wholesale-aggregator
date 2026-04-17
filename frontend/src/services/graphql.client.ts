import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
} from '@apollo/client'

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
})

export const apolloClient = new ApolloClient({
  link:  httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: { merge: false },
          orders:   { merge: false },
        },
      },
    },
  }),
})

// ── Queries
export const GET_PRODUCTS = gql`
  query GetProducts($tenantId: String!, $filter: ProductFilter, $pagination: PaginationInput) {
    products(tenantId: $tenantId, filter: $filter, pagination: $pagination) {
      nodes {
        id sku name category basePrice stockQty unit isActive
        vendor { id name feedType }
      }
      total page totalPages
    }
  }
`

export const GET_ORDERS = gql`
  query GetOrders($tenantId: String!, $filter: OrderFilter) {
    orders(tenantId: $tenantId, filter: $filter) {
      nodes {
        id status totalAmount createdAt notes
        lineItems { sku name quantity unitPrice total }
      }
      total page totalPages
    }
  }
`

export const GET_ANALYTICS = gql`
  query GetAnalytics($tenantId: String!, $days: Int) {
    analytics(tenantId: $tenantId, days: $days) {
      totalOrders totalRevenue avgOrderValue
      fulfilledOrders cancelledOrders
      topProducts { sku name quantity revenue }
    }
  }
`

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!, $tenantId: String!) {
    createOrder(input: $input, tenantId: $tenantId) {
      id status totalAmount
      lineItems { sku quantity unitPrice total }
    }
  }
`

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: String!, $status: OrderStatus!, $tenantId: String!) {
    updateOrderStatus(id: $id, status: $status, tenantId: $tenantId) {
      id status updatedAt
    }
  }
`