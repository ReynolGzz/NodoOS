'use client'

import { motion } from 'framer-motion'

interface PersonalizedGreetingProps {
  greeting: string
}

export function PersonalizedGreeting({ greeting }: PersonalizedGreetingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-4 pb-2"
    >
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{greeting}</p>
    </motion.div>
  )
}
