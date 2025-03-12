"use client"

import { useState, useEffect } from "react"

type OnboardingStep = {
  id: number
  completed: boolean
}

export const useOnboardingProgress = () => {
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { id: 1, completed: false },
    { id: 2, completed: false },
    { id: 3, completed: false },
    { id: 4, completed: false }
  ])

  // Load from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem("onboardingProgress")
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress)
        setSteps(parsedProgress)
      } catch (error) {
        console.error("Error parsing onboarding progress:", error)
      }
    }
  }, [])

  // Save to localStorage whenever steps change
  useEffect(() => {
    localStorage.setItem("onboardingProgress", JSON.stringify(steps))
  }, [steps])

  const markStepCompleted = (stepId: number) => {
    setSteps(currentSteps =>
      currentSteps.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    )
  }

  const resetProgress = () => {
    const resetSteps = steps.map(step => ({ ...step, completed: false }))
    setSteps(resetSteps)
  }

  const activeStep = steps.find(step => !step.completed)?.id || steps.length
  const completedSteps = steps
    .filter(step => step.completed)
    .map(step => step.id)
  const isAllCompleted = completedSteps.length === steps.length

  return {
    steps,
    activeStep,
    completedSteps,
    isAllCompleted,
    markStepCompleted,
    resetProgress
  }
}
