import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState }           from '../store'
import { clearUser }                from '../store'
import { authApi, ordersApi }       from '../services/api'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

const STATUS_COLORS: Record<string, string> = {
  draft:      '#94a3b8',
  confirmed:  '#3b82f6',
  processing: '#f59e0b',
  fulfilled:  '#10b981',
  cancelled:  '#ef4444',
}

export default function DashboardScreen({ navigation }: any) {
  const dispatch       = useDispatch()
  const { user }       = useSelector((s: RootState) => s.auth)
  const [orders,   setOrders]   = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const r = await ordersApi.getAll(TENANT_ID)
      setOrders(r.data?.orders || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleLogout = async () => {
    await authApi.logout()
    dispatch(clearUser())
    navigation.replace('Login')
  }

  const stats = [
    { label: 'Total',     value: orders.length,                              color: '#3b82f6' },
    { label: 'Draft',     value: orders.filter(o => o.status==='draft').length,  color: '#94a3b8' },
    { label: 'Confirmed', value: orders.filter(o => o.status==='confirmed').length, color: '#10b981' },
    { label: 'Fulfilled', value: orders.filter(o => o.status==='fulfilled').length, color: '#8b5cf6' },
  ]

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true); fetchData()
        }} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            👋 {user?.first_name || 'Admin'}!
          </Text>
          <Text style={styles.role}>{user?.role} • Wholesale</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label}
                style={[styles.statCard, { borderLeftColor: s.color }]}>
            <Text style={[styles.statValue, { color: s.color }]}>
              {s.value}
            </Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : orders.slice(0, 10).map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetail', { order })}
          >
            <View style={styles.orderRow}>
              <Text style={styles.orderId}>
                #{order.id?.slice(0, 8)}
              </Text>
              <View style={[styles.statusBadge,
                { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
                <Text style={[styles.statusText,
                  { color: STATUS_COLORS[order.status] }]}>
                  {order.status}
                </Text>
              </View>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderAmount}>
                ₹{Number(order.total_amount).toFixed(2)}
              </Text>
              <Text style={styles.orderDate}>
                {new Date(order.created_at).toLocaleDateString('en-IN')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingTop: 60,
    backgroundColor: '#1e293b',
  },
  greeting:  { color: 'white', fontSize: 20, fontWeight: 'bold' },
  role:      { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#ef4444', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 10,
  },
  logoutText: { color: 'white', fontSize: 13, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', padding: 12, gap: 8,
    backgroundColor: 'white',
  },
  statCard: {
    flex: 1, backgroundColor: '#f8fafc', borderRadius: 10,
    padding: 12, borderLeftWidth: 3, alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#64748b', fontSize: 11, marginTop: 2 },
  section:      { padding: 16 },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12,
  },
  loadingText: { color: '#94a3b8', textAlign: 'center', padding: 20 },
  orderCard: {
    backgroundColor: 'white', borderRadius: 12, padding: 14,
    marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  orderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  orderId:     { fontFamily: 'monospace', fontSize: 13, color: '#1e293b' },
  orderAmount: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  orderDate:   { color: '#94a3b8', fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText:  { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
})