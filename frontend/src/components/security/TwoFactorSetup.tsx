import { useState, useRef, useEffect } from 'react'
import { gsap }   from 'gsap'
import axios      from 'axios'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'

const AUTH_URL = 'http://localhost:3001'

export default function TwoFactorSetup() {
  const { user }       = useSelector((s: RootState) => s.auth)
  const [step,   setStep]   = useState<'intro' | 'qr' | 'verify' | 'done'>('intro')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [token,  setToken]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,  setError]  = useState('')

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    )
  }, [step])

  const handleSetup = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${AUTH_URL}/auth/2fa/setup`, {
        userId: user?.id,
        email:  user?.email,
      })
      setQrCode(res.data.data.qrCode)
      setSecret(res.data.data.secret)
      setBackupCodes(res.data.data.backupCodes)
      setStep('qr')
    } catch {
      setError('Setup failed — try again')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${AUTH_URL}/auth/2fa/enable`, {
        userId: user?.id,
        token,
      })
      if (res.data.success) {
        setStep('done')
      } else {
        setError('Invalid code — try again')
      }
    } catch {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div ref={cardRef}
           className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">

        {step === 'intro' && (
          <>
            <div className="text-center mb-6">
              <span className="text-5xl">🔐</span>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-3">
                Two-Factor Authentication
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Apna account extra secure banao
              </p>
            </div>
            <div className="space-y-3 mb-6">
              {['Google Authenticator', 'Authy', 'Microsoft Authenticator'].map((app) => (
                <div key={app}
                     className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-xl">📱</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{app}</span>
                  <span className="ml-auto text-xs text-green-600">✓ Supported</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              {loading ? '⏳ Setting up...' : '🔐 Enable 2FA'}
            </button>
          </>
        )}

        {step === 'qr' && (
          <>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              📱 Scan QR Code
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Authenticator app se yeh QR code scan karo
            </p>

            {/* QR Code */}
            {qrCode && (
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="2FA QR Code"
                     className="w-48 h-48 border-4 border-white rounded-xl shadow-lg" />
              </div>
            )}

            {/* Manual key */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-500 mb-1">Manual key:</p>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                {secret}
              </code>
            </div>

            {/* Backup codes */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                ⚠️ Backup Codes — Save karo!
              </p>
              <div className="grid grid-cols-2 gap-1">
                {backupCodes.map((code) => (
                  <code key={code}
                        className="text-xs font-mono bg-white dark:bg-slate-700 px-2 py-1 rounded text-center">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              Next → Verify Code
            </button>
          </>
        )}

        {step === 'verify' && (
          <>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              ✅ Verify Setup
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Authenticator app ka 6-digit code enter karo
            </p>

            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-3xl font-mono tracking-widest px-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500 mb-4"
              maxLength={6}
            />

            {error && (
              <p className="text-red-500 text-sm text-center mb-4">❌ {error}</p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || token.length !== 6}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-slate-300 transition-colors"
            >
              {loading ? '⏳ Verifying...' : '✅ Enable 2FA'}
            </button>
          </>
        )}

        {step === 'done' && (
          <div className="text-center">
            <span className="text-6xl">🎉</span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-4">
              2FA Enabled!
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Aapka account ab zyada secure hai
            </p>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-green-700 dark:text-green-400 text-sm">
                ✅ Agle login pe 2FA code maanga jayega
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}