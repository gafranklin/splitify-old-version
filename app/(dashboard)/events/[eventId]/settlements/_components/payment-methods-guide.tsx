"use client"

import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  DollarSign,
  ExternalLink,
  Smartphone,
  CopyCheck,
  ShieldCheck,
  RefreshCw
} from "lucide-react"

export default function PaymentMethodsGuide() {
  const [activeTab, setActiveTab] = useState("apps")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods Guide</CardTitle>
        <CardDescription>
          Learn about different payment options and how to use them
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="apps">
              <Smartphone className="mr-2 size-4" />
              Payment Apps
            </TabsTrigger>
            <TabsTrigger value="bank">
              <CreditCard className="mr-2 size-4" />
              Bank Transfers
            </TabsTrigger>
            <TabsTrigger value="cash">
              <DollarSign className="mr-2 size-4" />
              Cash & Other
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apps" className="mt-4 space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="venmo">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-blue-100 p-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19.5 4.5V19.5H4.5V4.5H19.5ZM21 3H3V21H21V3ZM15.38 6.5C14.22 9.16 12.56 12.47 12.01 13.68C11.66 14.44 11.27 14.68 10.77 14.68C10.23 14.68 9.73 14.15 9.28 13.32L7.46 9.86C6.69 10.6 6 11.26 5.44 11.87L6.11 13.31L6.75 14.67C7.19 15.59 7.53 16.32 8.86 16.32C10.15 16.32 11.02 15.73 11.79 14.21C12.3 13.24 15.21 7.36 15.21 7.36L13.21 6.5H15.38Z"
                          fill="#3396CC"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Venmo</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <p>
                    Venmo is a mobile payment service owned by PayPal that
                    allows users to transfer money to others using a mobile app.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">How to pay with Venmo:</h4>
                    <ol className="text-muted-foreground list-inside list-decimal space-y-1">
                      <li>Open the Venmo app</li>
                      <li>Tap the "Pay or Request" button</li>
                      <li>Enter the recipient's username, phone, or email</li>
                      <li>Enter the payment amount</li>
                      <li>Include the reference code in the notes</li>
                      <li>Tap "Pay"</li>
                    </ol>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <div className="flex gap-3">
                      <div className="flex items-center">
                        <ShieldCheck className="mr-1 size-4 text-green-500" />
                        <span className="text-xs">Secure</span>
                      </div>
                      <div className="flex items-center">
                        <RefreshCw className="mr-1 size-4 text-green-500" />
                        <span className="text-xs">Instant</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://venmo.com/download"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1 size-3" />
                        Get Venmo
                      </a>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="paypal">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-blue-100 p-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.02 6.11C7.5 4.43 9.09 3 11.2 3H16.27C16.37 3 16.48 3.05 16.55 3.15C16.63 3.25 16.67 3.37 16.65 3.49C16.03 7.67 13.13 9.1 9.5 9.1H8.07C7.86 9.1 7.68 9.24 7.63 9.44L6.28 15.46C6.25 15.57 6.28 15.69 6.34 15.79C6.41 15.88 6.52 15.93 6.63 15.93H9.11C9.3 15.93 9.46 15.81 9.51 15.64L9.79 14.32C9.83 14.15 9.99 14.03 10.18 14.03H10.72C13.72 14.03 15.91 12.22 16.43 8.66C16.68 7 16.38 5.65 15.59 4.74C15.53 4.67 15.48 4.59 15.45 4.52C15.41 4.43 15.36 4.32 15.32 4.22C15.23 3.96 15.15 3.66 15.1 3.3H15.09C15.82 3.32 16.44 3.43 16.96 3.65C17.04 3.69 17.12 3.73 17.2 3.77C17.31 3.83 17.42 3.9 17.52 3.97C17.67 4.07 17.81 4.18 17.93 4.3C18.5 4.86 18.79 5.7 18.79 6.8C18.16 11.05 15.32 13.07 11.5 13.07H11.04C10.7 13.07 10.4 13.3 10.32 13.62L9.42 18.16C9.39 18.27 9.42 18.38 9.49 18.47C9.55 18.56 9.66 18.62 9.77 18.62H11.93C12.12 18.62 12.28 18.49 12.33 18.32L12.59 17.1C12.63 16.93 12.79 16.81 12.98 16.81H13.47C16.35 16.81 18.44 15.07 18.94 11.69C19.31 9.26 18.47 7.52 17.02 6.6C17.09 6.45 17.15 6.28 17.2 6.11H7.02Z"
                          fill="#0070E0"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">PayPal</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <p>
                    PayPal is a global online payment system that supports
                    online money transfers and serves as an electronic
                    alternative to checks and money orders.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">How to pay with PayPal:</h4>
                    <ol className="text-muted-foreground list-inside list-decimal space-y-1">
                      <li>Log in to your PayPal account</li>
                      <li>Click "Send & Request" at the top of the page</li>
                      <li>
                        Enter the recipient's email address or phone number
                      </li>
                      <li>Enter the payment amount</li>
                      <li>Add the reference code in the notes</li>
                      <li>Click "Send"</li>
                    </ol>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <div className="flex gap-3">
                      <div className="flex items-center">
                        <ShieldCheck className="mr-1 size-4 text-green-500" />
                        <span className="text-xs">Secure</span>
                      </div>
                      <div className="flex items-center">
                        <CopyCheck className="mr-1 size-4 text-green-500" />
                        <span className="text-xs">Receipt</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://www.paypal.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1 size-3" />
                        Go to PayPal
                      </a>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cashapp">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-green-100 p-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM17.977 14.816L16.652 16.232C16.272 16.642 15.795 16.902 15.279 16.984C14.507 17.1 13.724 16.86 13.119 16.319L11.051 14.496C10.868 14.334 10.592 14.361.436 14.554L7.469 17.339C7.263 17.534 6.964 17.593 6.702 17.494L5.017 16.857C4.758 16.758 4.561 16.555 4.468 16.302L3.465 13.764C3.364 13.484 3.428 13.171 3.632 12.952L6.075 10.317C6.255 10.125 6.52 10.035 6.782 10.085C7.003 10.126 7.203 10.242 7.35 10.413L7.698 10.82L8.463 11.702L9.304 12.67C9.469 12.86 9.748 12.917 9.978 12.817L10.841 12.446C11.074 12.344 11.197 12.089 11.145 11.841L10.816 10.271C10.77 10.05 10.87 9.822 11.059 9.695L12.191 8.936C12.36 8.821 12.579 8.798 12.769 8.878L14.578 9.629C14.82 9.729 14.97 9.971 14.957 10.232L14.917 10.915C14.902 11.199 15.063 11.464 15.323 11.58L16.072 11.882C16.333 11.998 16.486 12.265 16.463 12.546L16.358 13.794C16.335 14.067 16.482 14.328 16.731 14.442L17.665 14.825C17.844 14.906 17.967 15.076 17.989 15.27C18.01 15.463 17.93 15.654 17.777 15.774L17.977 14.816Z"
                          fill="#00D632"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Cash App</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <p>
                    Cash App is a mobile payment service developed by Square,
                    Inc. that allows users to transfer money to one another
                    using a mobile app.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">How to pay with Cash App:</h4>
                    <ol className="text-muted-foreground list-inside list-decimal space-y-1">
                      <li>Open the Cash App</li>
                      <li>Enter the payment amount</li>
                      <li>Tap "Pay"</li>
                      <li>
                        Enter the recipient's $Cashtag, phone number, or email
                      </li>
                      <li>Include the reference code in the notes</li>
                      <li>Tap "Pay"</li>
                    </ol>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <div className="flex gap-3">
                      <div className="flex items-center">
                        <RefreshCw className="mr-1 size-4 text-green-500" />
                        <span className="text-xs">Instant</span>
                      </div>
                      <div className="flex items-center">
                        <CopyCheck className="mr-1 size-4 text-green-500" />
                        <span className="text-xs">Receipt</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://cash.app"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1 size-3" />
                        Get Cash App
                      </a>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="bank" className="mt-4 space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="zelle">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-purple-100 p-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.42 8.5L17 4H7L3.58 8.5L2 10.5V18.5H22V10.5L20.42 8.5ZM10.35 16H7.35L11.35 10.5H8.35L12.35 5H15.35L11.35 10.5H14.35L10.35 16Z"
                          fill="#6E31A1"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Zelle</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <p>
                    Zelle is a U.S.-based digital payments network owned by
                    Early Warning Services, a private financial services company
                    owned by several major banks.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">How to pay with Zelle:</h4>
                    <ol className="text-muted-foreground list-inside list-decimal space-y-1">
                      <li>Log into your banking app</li>
                      <li>Navigate to Zelle or digital payments</li>
                      <li>
                        Enter the recipient's email address or phone number
                      </li>
                      <li>Enter the payment amount</li>
                      <li>Add the reference code in the memo/notes field</li>
                      <li>Confirm and send the payment</li>
                    </ol>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <div className="flex gap-3">
                      <div className="flex items-center">
                        <ShieldCheck className="mr-1 size-4 text-green-500" />
                        <span className="text-xs">Secure</span>
                      </div>
                      <div className="flex items-center">
                        <RefreshCw className="mr-1 size-4 text-green-500" />
                        <span className="text-xs">Instant</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://www.zellepay.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1 size-3" />
                        Learn More
                      </a>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bank-transfer">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-slate-100 p-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
                          fill="#475569"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Bank Transfer</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <p>
                    Bank transfers allow you to send money directly from your
                    bank account to someone else's account.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      How to make a bank transfer:
                    </h4>
                    <ol className="text-muted-foreground list-inside list-decimal space-y-1">
                      <li>Log into your online banking</li>
                      <li>Navigate to transfers or payments</li>
                      <li>
                        Select "Transfer to someone else" or similar option
                      </li>
                      <li>Enter the recipient's bank details</li>
                      <li>Enter the payment amount</li>
                      <li>Add the reference code in the reference field</li>
                      <li>Review and confirm the transfer</li>
                    </ol>
                  </div>
                  <div className="mt-3 flex items-center border-t pt-3">
                    <div className="flex gap-3">
                      <div className="flex items-center">
                        <ShieldCheck className="mr-1 size-4 text-green-500" />
                        <span className="text-xs">Secure</span>
                      </div>
                      <div className="flex items-center">
                        <CopyCheck className="mr-1 size-4 text-green-500" />
                        <span className="text-xs">Receipt</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="cash" className="mt-4 space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cash">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-green-100 p-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12.88 17.76V19H11.12V17.73C9.55 17.44 8.26 16.5 8.10 15.03H9.90C10.03 15.68 10.82 16.19 12.00 16.19C13.30 16.19 13.99 15.58 13.99 14.75C13.99 13.99 13.45 13.53 12.08 13.24L10.87 12.97C9.28 12.61 8.31 11.73 8.31 10.33C8.31 8.81 9.56 7.75 11.12 7.45V6H12.88V7.50C14.29 7.85 15.32 8.84 15.41 10.13H13.61C13.50 9.46 12.86 8.97 11.97 8.97C10.89 8.97 10.22 9.52 10.22 10.31C10.22 11.02 10.80 11.45 11.97 11.71L13.12 11.97C14.88 12.38 15.89 13.22 15.89 14.68C15.88 16.32 14.66 17.41 12.88 17.76Z"
                          fill="#15803D"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Cash</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <p>
                    Paying with cash is a traditional method that involves
                    physical currency exchange.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Tips for cash payments:</h4>
                    <ul className="text-muted-foreground list-inside list-disc space-y-1">
                      <li>Always count the cash together with the recipient</li>
                      <li>Request a written receipt signed by both parties</li>
                      <li>Include the reference code on the receipt</li>
                      <li>Take a photo of the receipt for your records</li>
                      <li>Exchange cash in a safe, public location</li>
                    </ul>
                  </div>
                  <div className="mt-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                    <p>
                      <strong>Note:</strong> For safety and record-keeping,
                      consider a digital payment method instead of cash for
                      large amounts.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="check">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-blue-50 p-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3ZM21 19H3V5H21V19ZM14 17H17V15H14V17ZM14 13H19V11H14V13ZM13 9V7H8C6.9 7 6 7.9 6 9V15C6 16.1 6.9 17 8 17H10V15H8V13H10V11H8V9H13Z"
                          fill="#1D4ED8"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Check</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <p>
                    Personal checks are a paper document that instructs a bank
                    to pay a specific amount to the recipient.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">How to write a check:</h4>
                    <ol className="text-muted-foreground list-inside list-decimal space-y-1">
                      <li>Write the current date</li>
                      <li>Write the recipient's name on the "Pay to" line</li>
                      <li>Write the payment amount in numbers in the box</li>
                      <li>Write the payment amount in words on the line</li>
                      <li>Add the reference code in the memo line</li>
                      <li>Sign the check</li>
                    </ol>
                  </div>
                  <div className="mt-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                    <p>
                      <strong>Note:</strong> Checks take several business days
                      to clear. Make sure to notify the recipient when you've
                      sent a check.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <span className="text-muted-foreground text-xs">
          Always include the reference code with your payment
        </span>
      </CardFooter>
    </Card>
  )
}
