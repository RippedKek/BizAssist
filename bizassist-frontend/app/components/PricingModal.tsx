'use client'

import React, { useEffect, useState } from 'react'
import { X, Check, Crown } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAppSelector } from '../redux/hooks'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'dark' | 'light'
}

type PlanType = 'basic' | 'pro' | 'enterprise'

interface Plan {
  id: PlanType
  name: string
  price: string
  priceAmount: number
  features: string[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    priceAmount: 0,
    features: [
      'Idea summarizer',
      'Basic market analysis',
      '1 project',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '৳ 500 /month',
    priceAmount: 500,
    features: [
      'All Basic features',
      'Advanced market analysis',
      'Idea ranking & pitch generation',
      '5 projects',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '৳ 2000 /month',
    priceAmount: 2000,
    features: [
      'All Pro features',
      'Visual branding',
      'Pitch practice with feedback',
      'Unlimited projects',
      'Dedicated support',
    ],
  },
]

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const { user } = useAppSelector((state) => state.user)
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null)
  const [loading, setLoading] = useState(true)
  const isDark = theme === 'dark'

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.email))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const account = userData.account || 'basic'
          setCurrentPlan(account as PlanType)
        } else {
          setCurrentPlan('basic')
        }
      } catch (error) {
        console.error('Error fetching user plan:', error)
        setCurrentPlan('basic')
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && user?.email) {
      fetchUserPlan()
    }
  }, [isOpen, user?.email])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border ${
          isDark
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
          }`}
        >
          <h2
            className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Choose Your Plan
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Plans Grid */}
        <div className='p-6'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin' />
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {plans.map((plan) => {
                const isCurrentPlan = currentPlan === plan.id
                const isUpgrade =
                  currentPlan === 'basic' && plan.id !== 'basic' ||
                  currentPlan === 'pro' && plan.id === 'enterprise'

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 p-6 transition-all ${
                      isCurrentPlan
                        ? isDark
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-blue-500 bg-blue-50'
                        : isDark
                        ? 'border-gray-800 bg-gray-800/50 hover:border-gray-700'
                        : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                    } ${plan.popular ? 'md:scale-105' : ''}`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                        <span className='bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full'>
                          Popular
                        </span>
                      </div>
                    )}

                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <div className='absolute -top-3 right-4'>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${
                            isDark
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          <Crown className='w-3 h-3' />
                          Current Plan
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className='mb-6'>
                      <h3
                        className={`text-2xl font-bold mb-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <div className='flex items-baseline gap-2'>
                        <span
                          className={`text-3xl font-bold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {plan.price}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className='space-y-3 mb-6'>
                      {plan.features.map((feature, index) => (
                        <li key={index} className='flex items-start gap-3'>
                          <Check
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              isDark ? 'text-blue-400' : 'text-blue-600'
                            }`}
                          />
                          <span
                            className={`${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <button
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        isCurrentPlan
                          ? isDark
                            ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan
                        ? 'Current Plan'
                        : isUpgrade
                        ? 'Upgrade'
                        : plan.id === 'basic'
                        ? 'Downgrade'
                        : 'Select Plan'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PricingModal

