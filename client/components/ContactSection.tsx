"use client"

import { useReducer } from "react"
import { Send, CheckCircle, AlertCircle } from "lucide-react"

type FormState = {
    formData: {
        name: string
        email: string
        message: string
    }
    errors: {
        email: string
        message: string
    }
    isSubmitting: boolean
    submitStatus: "idle" | "success" | "error"
}

type FormAction =
    | { type: "SET_FIELD"; field: string; value: string }
    | { type: "SET_ERRORS"; errors: { email: string; message: string } }
    | { type: "START_SUBMIT" }
    | { type: "SUBMIT_SUCCESS" }
    | { type: "RESET_STATUS" }

const initialState: FormState = {
    formData: {
        name: "",
        email: "",
        message: "",
    },
    errors: {
        email: "",
        message: "",
    },
    isSubmitting: false,
    submitStatus: "idle",
}

function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case "SET_FIELD":
            return {
                ...state,
                formData: { ...state.formData, [action.field]: action.value },
                // Clear specific error when field is modified
                errors: {
                    ...state.errors,
                    [action.field]: "",
                },
            }
        case "SET_ERRORS":
            return {
                ...state,
                errors: action.errors,
            }
        case "START_SUBMIT":
            return {
                ...state,
                isSubmitting: true,
            }
        case "SUBMIT_SUCCESS":
            return {
                ...state,
                isSubmitting: false,
                submitStatus: "success",
                formData: { name: "", email: "", message: "" },
                errors: { email: "", message: "" }, // Ensure errors are cleared on success
            }
        case "RESET_STATUS":
            return {
                ...state,
                submitStatus: "idle",
            }
        default:
            return state
    }
}

export default function ContactSection() {
    const [state, dispatch] = useReducer(formReducer, initialState)
    const { formData, errors, isSubmitting, submitStatus } = state

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        dispatch({ type: "SET_FIELD", field: name, value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation Logic
        const newErrors = { email: "", message: "" }
        let isValid = true

        if (!validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email address."
            isValid = false
        }

        if (formData.message.length < 10) {
            newErrors.message = "Message must be at least 10 characters long."
            isValid = false
        }

        if (!isValid) {
            dispatch({ type: "SET_ERRORS", errors: newErrors })
            return
        }

        dispatch({ type: "START_SUBMIT" })

        // Simulate API call
        setTimeout(() => {
            dispatch({ type: "SUBMIT_SUCCESS" })

            // Reset success message after 5 seconds
            setTimeout(() => dispatch({ type: "RESET_STATUS" }), 5000)
        }, 1500)
    }

    return (
        <section id="contact" className="py-16 md:py-24 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-12 items-center">

                    {/* Text Content */}
                    <div className="w-full md:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 text-[#08294B]">
                            Get in <span className="text-[#FA7436]">Touch</span>
                        </h2>
                        <p className="text-gray-600 font-poppins mb-8 text-lg">
                            Have questions about facility reservations? Need help with your booking?
                            Fill out the form and our support team will get back to you within 24 hours.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-[#FA7436]/10 p-3 rounded-full text-[#FA7436]">
                                    <Send size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#08294B] font-poppins">Email Support</h3>
                                    <p className="text-gray-600">help@academyspace.ac.id</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-[#08294B]/10 p-3 rounded-full text-[#08294B]">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#08294B] font-poppins">Help Center</h3>
                                    <p className="text-gray-600">Visit our guide section for FAQs</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="w-full md:w-1/2 bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100">
                        {submitStatus === "success" ? (
                            <div className="text-center py-12 animate-fadeIn">
                                <div className="flex justify-center mb-4 text-green-500">
                                    <CheckCircle size={64} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#08294B] mb-2">Message Sent!</h3>
                                <p className="text-gray-600">Thank you for contacting us. We will reply shortly.</p>
                                <button
                                    onClick={() => dispatch({ type: "RESET_STATUS" })}
                                    className="mt-6 text-[#FA7436] font-medium hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FA7436] focus:border-transparent outline-none transition-all"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-[#FA7436] focus:border-transparent outline-none transition-all`}
                                        placeholder="Enter your email"
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-[#FA7436] focus:border-transparent outline-none transition-all`}
                                        placeholder="How can we help you?"
                                        required
                                    ></textarea>
                                    {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                                    <p className="mt-1 text-xs text-gray-400 text-right">
                                        {formData.message.length}/10 characters minimum
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#FA7436] text-white font-bold py-3 rounded-lg hover:bg-[#e5672f] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>Sending...</>
                                    ) : (
                                        <>
                                            Send Message <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
