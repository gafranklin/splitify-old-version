"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function PaymentMethods() {
  const paymentMethods = [
    {
      name: "Cash",
      icon: "/images/payment-methods/cash.svg",
      color: "bg-green-100"
    },
    {
      name: "Venmo",
      icon: "/images/payment-methods/venmo.svg",
      color: "bg-blue-100"
    },
    {
      name: "PayPal",
      icon: "/images/payment-methods/paypal.svg",
      color: "bg-indigo-100"
    },
    {
      name: "Zelle",
      icon: "/images/payment-methods/zelle.svg",
      color: "bg-purple-100"
    },
    {
      name: "Cash App",
      icon: "/images/payment-methods/cashapp.svg",
      color: "bg-yellow-100"
    },
    {
      name: "Bank Transfer",
      icon: "/images/payment-methods/bank.svg",
      color: "bg-gray-100"
    }
  ]

  return (
    <section className="bg-muted/50 w-full py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Pay Your Way
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Splitify supports all payment methods, giving you the flexibility to
            settle up however you prefer.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex flex-col items-center justify-center rounded-lg ${method.color} p-6 text-center shadow-sm`}
            >
              <div className="mb-3 flex size-12 items-center justify-center">
                <div className="relative size-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    {method.name === "Cash" && (
                      <>
                        <rect width="20" height="12" x="2" y="6" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M6 12h.01M18 12h.01" />
                      </>
                    )}
                    {method.name === "Venmo" && (
                      <>
                        <path d="M17.7 19.7a2.5 2.5 0 0 1-3.5 0l-8.5-8.5a2.5 2.5 0 0 1 0-3.5l8.5-8.5a2.5 2.5 0 0 1 3.5 0l8.5 8.5a2.5 2.5 0 0 1 0 3.5Z" />
                        <path d="m14 14 7-7" />
                        <path d="m10 18 3-3" />
                      </>
                    )}
                    {method.name === "PayPal" && (
                      <>
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        <path d="M8 14v4a5 5 0 0 0 9.9 1" />
                        <path d="M11 12H6l-3 6" />
                        <path d="M15.5 6H19l3 6" />
                        <path d="M17 12h4" />
                        <path d="M13 12h-2" />
                      </>
                    )}
                    {method.name === "Zelle" && (
                      <>
                        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                      </>
                    )}
                    {method.name === "Cash App" && (
                      <>
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </>
                    )}
                    {method.name === "Bank Transfer" && (
                      <>
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                        <path d="M6 15h1m3 0h1m3 0h1m3 0h1" />
                      </>
                    )}
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium">{method.name}</h3>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            And many more! Splitify lets you track payments made through any
            method.
          </p>
        </div>
      </div>
    </section>
  )
}
