"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, UploadCloud, FileText, CheckCircle2 } from "lucide-react";

export default function StudentVerify() {
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "verified">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if it's a valid student email domain
    if (!email.endsWith(".edu") && !email.endsWith(".ac") && !email.endsWith(".edu.gh")) {
      alert("Please enter a valid student email ending in .edu, .ac, or .edu.gh");
      return;
    }

    if (!file) {
      alert("Please upload your student ID or enrollment document.");
      return;
    }

    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("university", university);
      formData.append("gradYear", gradYear);
      formData.append("file", file);

      setStatus("analyzing");
      
      const verifyRes = await fetch("/api/student-verify", {
        method: "POST",
        body: formData,
      });
      
      const verifyData = await verifyRes.json();
      
      if (!verifyData.isVerified && verifyRes.ok) {
        setStatus("idle");
        alert(`Verification failed: ${verifyData.reason}`);
        return;
      }

      setStatus("verified");
      
      // Proceed to checkout for the student plan
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "Student",
          amount: 4.99,
          email: email,
        }),
      });
      
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        setStatus("idle");
        alert(checkoutData.error || "Failed to initialize checkout.");
      }
    } catch (err) {
      console.error("Verification/Checkout error:", err);
      setStatus("idle");
      alert("An error occurred during verification. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full bg-surface border border-border-mute rounded-xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold mb-2">Student Verification</h1>
          <p className="text-text-muted text-sm mb-8">
            Upload your student ID or proof of enrollment. We automatically verify it to grant you 50% off.
          </p>
          
          {status === "idle" ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 ml-1">
                  University / College Name
                </label>
                <input 
                    type="text" 
                    required 
                    placeholder="e.g. University of Ghana"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border-mute rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 ml-1">
                    Student Email
                  </label>
                  <input 
                      type="email" 
                      required 
                      placeholder="student@uni.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border-mute rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 ml-1">
                    Graduation Year
                  </label>
                  <input 
                      type="number" 
                      required 
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 10}
                      placeholder="2026"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border-mute rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="text-left mt-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 ml-1">
                  Proof of Enrollment (Student ID / Transcript)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border-mute hover:border-emerald-500 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/20 rounded-md cursor-pointer transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <>
                        <FileText className="w-8 h-8 text-emerald-500 mb-2" />
                        <p className="text-xs font-semibold text-foreground">{file.name}</p>
                        <p className="text-[10px] text-text-muted mt-1">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-text-muted mb-2" />
                        <p className="text-xs font-semibold text-foreground">Click to upload document</p>
                        <p className="text-[10px] text-text-muted mt-1">PNG, JPG, or PDF (Max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </label>
              </div>

              <button 
                type="submit" 
                disabled={!email || !university || !gradYear || !file}
                className="w-full bg-indigo-600 text-white mt-4 py-3 rounded-md text-sm font-semibold hover:bg-indigo-700 flex justify-center items-center gap-2 transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm"
              >
                Start Verification
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-8 bg-surface rounded-lg border border-border-mute">
              {status === "uploading" && (
                <>
                  <UploadCloud className="w-8 h-8 text-indigo-500 animate-bounce" />
                  <p className="font-semibold text-sm text-foreground">Uploading securely...</p>
                </>
              )}
              {status === "analyzing" && (
                <>
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="font-semibold text-sm text-foreground">AI is reviewing your document...</p>
                  <p className="text-xs text-text-muted">Extracting university details</p>
                </>
              )}
              {status === "verified" && (
                <>
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  <p className="font-semibold text-sm text-foreground">Student Identity Verified!</p>
                  <p className="text-xs text-text-muted">Redirecting you to our secure checkout...</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
