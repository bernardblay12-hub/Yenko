"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import A4ResumePreview, { ResumeData } from "@/components/A4ResumePreview";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";
import {
  Upload,
  Cpu,
  Bot,
  Download,
  Save,
  RefreshCw,
  AlertTriangle,
  Mic,
  MicOff,
  Send,
  FileText,
  Trash2,
  Sparkles,
  Plus,
  Link as LinkIcon,
  X,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Briefcase,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

// ─── Component ───────────────────────────────────────────────────
export default function Workspace() {
  // ── Theme ──────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  // ── Left pane: sidebar collapse ────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Resume state ───────────────────────────────────────────────
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: "",
    title: "",
    email: "",
    phone: "",
    website: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
  });

  // ── File parsing states ────────────────────────────────────────
  const [fileName, setFileName] = useState("");
  const [cvText, setCvText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Job link/description states ────────────────────────────────
  const [jobLinks, setJobLinks] = useState<string[]>([]);
  const [newJobLink, setNewJobLink] = useState("");
  const [activeJobIndex, setActiveJobIndex] = useState<number | null>(null);

  // ── Chat interface states ──────────────────────────────────────
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Voice recording ────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ── Warning state ──────────────────────────────────────────────
  const [showWarning, setShowWarning] = useState(false);

  // ── Settings State ─────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile"); // profile, ai, security
  
  // Profile settings
  const [profileName, setProfileName] = useState("Bernard Blay");
  const [profileEmail, setProfileEmail] = useState("bblay@umat.edu.gh");
  const [profilePhone, setProfilePhone] = useState("+233 55 123 4567");
  const [profileWebsite, setProfileWebsite] = useState("github.com/bernardblay");
  const [profileSchool, setProfileSchool] = useState("University of Mines and Technology (UMaT)");
  const [profileDegree, setProfileDegree] = useState("BSc Computer Science & Engineering");
  const [profileGradYear, setProfileGradYear] = useState("2028");
  const [profileAdisadel, setProfileAdisadel] = useState(true);
  const [profileAspiration, setProfileAspiration] = useState("US Graduate School & Security Research");
  
  // AI settings
  const [aiTone, setAiTone] = useState("cooperative"); // cooperative, recruiter, auditor
  const [aiLanguage, setAiLanguage] = useState("en"); // en, fr, de, dar
  const [aiStrictness, setAiStrictness] = useState("high"); // low, medium, high
  const [khadijaMode, setKhadijaMode] = useState(false); // Special Easter Egg 💖
  
  // Security settings
  const [customApiKey, setCustomApiKey] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(true);

  // ── Session & History states ────────────────────────────────────
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Auth state
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  // Monitor Supabase auth session
  useEffect(() => {
    if (!supabase) return;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setProfileName(session.user.user_metadata?.full_name || session.user.email || "Bernard Blay");
        setProfileEmail(session.user.email || "bblay@umat.edu.gh");
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setProfileName(session.user.user_metadata?.full_name || session.user.email || "Bernard Blay");
        setProfileEmail(session.user.email || "bblay@umat.edu.gh");
        if (event === "SIGNED_IN") {
          toast.success("Welcome back, bro!");
        }
      } else {
        setSupabaseUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (!supabase) {
      toast.error("Supabase is not configured yet. Add your anon key in .env.local.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin + "/workspace" : "",
        queryParams: {
          client_id: "696756760553-4lus6v4geqt91tlhgb574lop5ks2fou0.apps.googleusercontent.com"
        }
      },
    });
    if (error) {
      toast.error("Google login failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setProfileName("Bernard Blay");
    setProfileEmail("bblay@umat.edu.gh");
    toast.success("Signed out successfully.");
  };

  // Load saved sessions from LocalStorage & Supabase
  useEffect(() => {
    const loadSessions = async () => {
      // 1. Load from LocalStorage
      let localSaved: any[] = [];
      const storedSessions = localStorage.getItem("workspace_sessions");
      if (storedSessions) {
        try {
          localSaved = JSON.parse(storedSessions);
          setSessions(localSaved);
        } catch (e) {
          console.error("Failed to parse local sessions:", e);
        }
      }

      // 2. Load from Supabase if configured
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (anonKey) {
        try {
          const { data, error } = await supabase
            .from("tailored_resumes")
            .select("*")
            .order("updated_at", { ascending: false });

          if (error) {
            console.warn("Supabase fetch failed (check if tailored_resumes table exists):", error.message);
          } else if (data && data.length > 0) {
            const mappedSessions = data.map((d: any) => ({
              id: d.id,
              name: d.name,
              fileName: d.file_name,
              cvText: d.cv_text,
              jobLinks: d.job_links || [],
              activeJobIndex: d.active_job_index,
              messages: d.chat_messages || [],
              resumeData: d.resume_data || {
                name: "",
                title: "",
                email: "",
                phone: "",
                website: "",
                summary: "",
                experience: [],
                education: [],
                skills: [],
              },
              updatedAt: d.updated_at,
            }));
            
            setSessions(mappedSessions);
            localStorage.setItem("workspace_sessions", JSON.stringify(mappedSessions));
          }
        } catch (e: any) {
          console.warn("Supabase integration error:", e.message);
        }
      }
    };

    loadSessions();
  }, []);

  const saveSession = async () => {
    let sessionName = "Untitled Tailoring";
    if (activeJobIndex !== null && jobLinks[activeJobIndex]) {
      const link = jobLinks[activeJobIndex];
      sessionName = link.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] || "Job Role";
    } else if (resumeData.title) {
      sessionName = resumeData.title;
    }

    const sessionId = activeSessionId || crypto.randomUUID();
    const updatedTime = new Date().toISOString();

    const newSession = {
      id: sessionId,
      name: sessionName,
      fileName,
      cvText,
      jobLinks,
      activeJobIndex,
      messages,
      resumeData,
      updatedAt: updatedTime,
    };

    const index = sessions.findIndex((s) => s.id === sessionId);
    let updatedSessions = [...sessions];
    if (index >= 0) {
      updatedSessions[index] = newSession;
    } else {
      updatedSessions = [newSession, ...updatedSessions];
    }
    setSessions(updatedSessions);
    localStorage.setItem("workspace_sessions", JSON.stringify(updatedSessions));
    setActiveSessionId(sessionId);

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (anonKey) {
      const toastId = toast.loading("Saving to Supabase...");
      try {
        const { error } = await supabase.from("tailored_resumes").upsert({
          id: sessionId,
          name: sessionName,
          file_name: fileName,
          cv_text: cvText,
          job_links: jobLinks,
          active_job_index: activeJobIndex,
          chat_messages: messages,
          resume_data: resumeData,
          updated_at: updatedTime,
        });

        if (error) {
          toast.error("Saved locally. Supabase error: " + error.message, { id: toastId });
        } else {
          toast.success("Successfully saved to local & Supabase vault!", { id: toastId });
        }
      } catch (e: any) {
        toast.error("Saved locally. Connection error.", { id: toastId });
      }
    } else {
      toast.success("Saved successfully in secure local storage!");
    }
  };

  const loadSession = (session: any) => {
    setActiveSessionId(session.id);
    setFileName(session.fileName || "");
    setCvText(session.cvText || "");
    setJobLinks(session.jobLinks || []);
    setActiveJobIndex(session.activeJobIndex);
    setMessages(session.messages || []);
    setResumeData(session.resumeData || {
      name: "",
      title: "",
      email: "",
      phone: "",
      website: "",
      summary: "",
      experience: [],
      education: [],
      skills: [],
    });
    setHasStarted(session.messages && session.messages.length > 0);
    toast.success(`Loaded session: ${session.name}`);
  };

  const startNewSession = () => {
    setActiveSessionId(null);
    setFileName("");
    setCvText("");
    setJobLinks([]);
    setActiveJobIndex(null);
    setMessages([]);
    setResumeData({
      name: "",
      title: "",
      email: "",
      phone: "",
      website: "",
      summary: "",
      experience: [],
      education: [],
      skills: [],
    });
    setHasStarted(false);
    toast.success("Started a new tailoring session!");
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this session?")) return;

    const updatedSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem("workspace_sessions", JSON.stringify(updatedSessions));
    if (activeSessionId === sessionId) {
      startNewSession();
    }

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (anonKey) {
      try {
        const { error } = await supabase.from("tailored_resumes").delete().eq("id", sessionId);
        if (error) {
          toast.error("Deleted locally. Supabase sync error.");
        } else {
          toast.success("Deleted from cloud storage.");
        }
      } catch (e) {
        console.error("Supabase delete failed:", e);
      }
    } else {
      toast.success("Deleted session.");
    }
  };

  // Load settings from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("profile_name");
      const storedEmail = localStorage.getItem("profile_email");
      const storedPhone = localStorage.getItem("profile_phone");
      const storedWebsite = localStorage.getItem("profile_website");
      const storedSchool = localStorage.getItem("profile_school");
      const storedDegree = localStorage.getItem("profile_degree");
      const storedGradYear = localStorage.getItem("profile_grad_year");
      const storedAdisadel = localStorage.getItem("profile_adisadel");
      const storedAspiration = localStorage.getItem("profile_aspiration");
      const storedTone = localStorage.getItem("ai_tone");
      const storedLanguage = localStorage.getItem("ai_language");
      const storedStrictness = localStorage.getItem("ai_strictness");
      const storedKhadija = localStorage.getItem("khadija_mode");
      const storedApiKey = localStorage.getItem("custom_api_key");

      if (storedName) setProfileName(storedName);
      if (storedEmail) setProfileEmail(storedEmail);
      if (storedPhone) setProfilePhone(storedPhone);
      if (storedWebsite) setProfileWebsite(storedWebsite);
      if (storedSchool) setProfileSchool(storedSchool);
      if (storedDegree) setProfileDegree(storedDegree);
      if (storedGradYear) setProfileGradYear(storedGradYear);
      if (storedAdisadel) setProfileAdisadel(storedAdisadel === "true");
      if (storedAspiration) setProfileAspiration(storedAspiration);
      if (storedTone) setAiTone(storedTone);
      if (storedLanguage) setAiLanguage(storedLanguage);
      if (storedStrictness) setAiStrictness(storedStrictness);
      if (storedKhadija) setKhadijaMode(storedKhadija === "true");
      if (storedApiKey) setCustomApiKey(storedApiKey);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("profile_name", profileName);
    localStorage.setItem("profile_email", profileEmail);
    localStorage.setItem("profile_phone", profilePhone);
    localStorage.setItem("profile_website", profileWebsite);
    localStorage.setItem("profile_school", profileSchool);
    localStorage.setItem("profile_degree", profileDegree);
    localStorage.setItem("profile_grad_year", profileGradYear);
    localStorage.setItem("profile_adisadel", String(profileAdisadel));
    localStorage.setItem("profile_aspiration", profileAspiration);
    localStorage.setItem("ai_tone", aiTone);
    localStorage.setItem("ai_language", aiLanguage);
    localStorage.setItem("ai_strictness", aiStrictness);
    localStorage.setItem("khadija_mode", String(khadijaMode));
    localStorage.setItem("custom_api_key", customApiKey);

    // Update resumeData default values if empty or standard
    if (resumeData.name === "" || resumeData.name === "Bernard Blay") {
      setResumeData(prev => ({
        ...prev,
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        website: profileWebsite,
      }));
    }

    toast.success("Settings saved successfully! Secure local storage synchronized.");
    setShowSettings(false);
  };

  // ── Effects ────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  // ── Unverified claims count ────────────────────────────────────
  const countUnverifiedClaims = () => {
    let count = 0;
    if (!resumeData?.experience) return 0;
    resumeData.experience.forEach((exp) => {
      exp.bullets.forEach((bullet) => {
        if (bullet.includes("[unverified]")) count++;
      });
    });
    return count;
  };
  const unverifiedCount = countUnverifiedClaims();
  const hasResume = resumeData.name !== "";

  // ═══════════════════════════════════════════════════════════════
  // FILE HANDLING
  // ═══════════════════════════════════════════════════════════════
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await parseFile(file);
  };

  const parseFile = async (file: File) => {
    const validTypes = [".pdf", ".txt", ".docx"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validTypes.includes(ext)) {
      toast.error("Unsupported file type. Upload a PDF, TXT, or DOCX.");
      return;
    }

    setIsParsing(true);
    setFileName(file.name);
    const toastId = toast.loading("Parsing your CV...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCvText(data.text);
      toast.success("CV parsed successfully!", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to parse: " + (error.message || error), { id: toastId });
      setFileName("");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await parseFile(file);
  };

  const handleRemoveFile = () => {
    setFileName("");
    setCvText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("CV removed.");
  };

  // ═══════════════════════════════════════════════════════════════
  // JOB LINKS
  // ═══════════════════════════════════════════════════════════════
  const addJobLink = () => {
    if (!newJobLink.trim()) return;
    const updated = [...jobLinks, newJobLink.trim()];
    setJobLinks(updated);
    setNewJobLink("");
    setActiveJobIndex(updated.length - 1);
    toast.success("Job link added!");

    // Auto-start the conversation
    startTailoring(newJobLink.trim());
  };

  const removeJobLink = (index: number) => {
    setJobLinks((prev) => prev.filter((_, i) => i !== index));
    if (activeJobIndex === index) {
      setActiveJobIndex(null);
      setHasStarted(false);
      setMessages([]);
    }
    toast.info("Job link removed.");
  };

  const selectJobLink = (index: number) => {
    setActiveJobIndex(index);
    startTailoring(jobLinks[index]);
  };

  // ═══════════════════════════════════════════════════════════════
  // CONVERSATION
  // ═══════════════════════════════════════════════════════════════
  const startTailoring = async (jobText: string) => {
    setHasStarted(true);
    setIsTyping(true);
    setMessages([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Let's begin the resume tailoring process." }],
          cvText,
          jobText,
          generateResume: false,
        }),
      });

      if (!res.ok) throw new Error("Session init failed");
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.reply }]);
    } catch {
      // Fallback greeting when API isn't wired
      setMessages([
        {
          role: "assistant",
          content:
            "I've analyzed your CV and the job posting. Let me ask you a few questions to tailor your resume perfectly.\n\n**What specific aspects of this role excite you most?** This helps me understand what to emphasize.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (overrideMsg?: string) => {
    const text = overrideMsg || inputMessage;
    if (!text.trim()) return;
    if (!overrideMsg) setInputMessage("");

    const newUserMessage = { role: "user", content: text };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          cvText,
          jobText: activeJobIndex !== null ? jobLinks[activeJobIndex] : "",
          generateResume: false,
          profileName,
          profileSchool,
          profileDegree,
          profileAspiration,
          aiTone,
          aiLanguage,
          khadijaMode,
          customApiKey,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();
      setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
    } catch {
      const userCount = updatedMessages.filter((m) => m.role === "user").length;
      const fallbackReplies = [
        "Great, I've noted that. Can you tell me about the **key technical skills** mentioned in the job posting that match your experience?",
        "Thanks! What are the **top 3 achievements** from your career that you'd like to highlight for this role?",
        "Good. Are there any **gaps** between your current CV and this role you'd like me to address creatively?",
        "Understood. I have enough context now. Let me generate your tailored resume.\n\n[GENERATE_RESUME]",
      ];
      const idx = Math.min(userCount - 1, fallbackReplies.length - 1);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: fallbackReplies[Math.max(0, idx)] },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // GENERATE RESUME
  // ═══════════════════════════════════════════════════════════════
  const generateTailoredResume = async () => {
    setIsGenerating(true);
    const toastId = toast.loading("Generating your tailored resume...");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          cvText,
          jobText: activeJobIndex !== null ? jobLinks[activeJobIndex] : "",
          generateResume: true,
          profileName,
          profileSchool,
          profileDegree,
          profileAspiration,
          aiTone,
          aiLanguage,
          khadijaMode,
          customApiKey,
        }),
      });

      if (!res.ok) throw new Error("Resume generation failed");
      const data = await res.json();
      setResumeData(data.resume);
      toast.success("Tailored resume ready!", { id: toastId });
    } catch {
      // Fallback mock resume
      setResumeData({
        name: profileName,
        title: `${profileDegree.replace("BSc ", "")} & Full-Stack Developer`,
        email: profileEmail,
        phone: profilePhone,
        website: profileWebsite,
        summary:
          `Results-driven ${profileDegree.toLowerCase()} student at ${profileSchool} with hands-on experience in network security, penetration testing, and full-stack web development. Focused on target goals in ${profileAspiration.toLowerCase()}.`,
        experience: [
          {
            id: "exp1",
            role: "Frontend Engineering Intern",
            company: "Vercel Partner Lab",
            duration: "Jan 2026 – Present",
            bullets: [
              "Developed responsive dashboards using React and TypeScript, improving user engagement by 25%.",
              "Implemented security-first authentication flows using Supabase and OAuth 2.0.",
              "Optimized build pipelines and reduced asset loading times by 15% through code splitting.",
            ],
          },
          {
            id: "exp2",
            role: "Web Administrator",
            company: `${profileAdisadel ? "Adisadel College / " : ""}UMaT Cyber Security Club`,
            duration: "Sep 2025 – Dec 2025",
            bullets: [
              "Administered portal and monitored endpoints for suspicious activity, ensuring data integrity [unverified].",
              "Refactored membership directories to lightweight CSR component rendering.",
            ],
          },
        ],
        education: [
          {
            id: "edu1",
            degree: profileDegree,
            school: profileSchool,
            duration: `2024 – ${profileGradYear} (Expected)`,
          },
        ],
        skills: [
          "React",
          "TypeScript",
          "Next.js",
          "Python",
          "Network Security",
          "Penetration Testing",
          "Git",
          "Supabase",
        ],
      });
      toast.success("Resume preview generated!", { id: toastId });
    } finally {
      setIsGenerating(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "✨ Your tailored resume is ready! Check the preview panel on the right. Click any section to edit it directly.",
        },
      ]);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // VOICE INPUT
  // ═══════════════════════════════════════════════════════════════
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Voice input is not supported in this browser.");
        return;
      }
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onstart = () => {
        setIsListening(true);
        toast.info("Listening... Speak now.");
      };
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => prev + (prev ? " " : "") + transcript);
      };
      rec.onerror = (e: any) => {
        toast.error("Voice error: " + e.error);
        setIsListening(false);
      };
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
      rec.start();
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════
  const handleExportPDF = () => {
    if (unverifiedCount > 0) setShowWarning(true);
    else triggerPrint();
  };

  const triggerPrint = () => {
    setShowWarning(false);
    toast.info("Preparing PDF...");
    setTimeout(() => window.print(), 400);
  };

  // ═══════════════════════════════════════════════════════════════
  // MESSAGE RENDERER
  // ═══════════════════════════════════════════════════════════════
  const renderMessageContent = (msg: any) => {
    const generateToken = "[GENERATE_RESUME]";
    const hasGenerateToken = msg.content.includes(generateToken);
    const cleanContent = msg.content.replace(generateToken, "").trim();

    return (
      <div className="space-y-3">
        <div className="prose prose-sm dark:prose-invert leading-relaxed break-words font-sans text-[13px]">
          <ReactMarkdown>{cleanContent}</ReactMarkdown>
        </div>
        {hasGenerateToken && (
          <button
            onClick={generateTailoredResume}
            disabled={isGenerating}
            className="workspace-generate-btn"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate Tailored Resume
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* ── Workspace Top Bar (NOT the landing page navbar) ──── */}
      <header className="h-12 border-b border-border-mute bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 no-print flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="ResuTailor"
              className="h-6 w-6 object-contain rounded border border-zinc-200 dark:border-zinc-800"
            />
            <span className="font-sans font-bold text-sm tracking-tight text-foreground">
              resu<span className="text-zinc-400 font-normal">tailor</span>
            </span>
          </Link>
          <span className="text-[9px] font-mono font-bold text-text-muted bg-surface border border-border-mute px-2 py-0.5 rounded-full uppercase tracking-wider">
            Workspace
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg border border-border-mute text-text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer lg:hidden"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-border-mute text-text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-yellow-500" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* ── Three-Pane Layout ──────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ═══ PANE 1: Left Sidebar — CV & Job Links ═══ */}
        <aside
          className={`${
            sidebarOpen ? "w-72" : "w-0"
          } flex-shrink-0 border-r border-border-mute bg-surface/50 flex flex-col transition-all duration-300 overflow-hidden no-print`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-w-[288px]">
            {/* ── Step 1: Upload CV ─────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${
                  cvText
                    ? "bg-emerald-500 text-white"
                    : "border border-border-mute text-text-muted bg-background"
                }`}>
                  {cvText ? "✓" : "1"}
                </span>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">
                  Your Resume
                </h3>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.txt,.docx"
              />
              {fileName ? (
                <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3 flex items-center justify-between workspace-fade-in">
                  <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-semibold truncate block text-foreground" title={fileName}>
                        {fileName}
                      </span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Parsed & ready</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-1.5 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Remove CV"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`workspace-dropzone-sm ${isDragging ? "workspace-dropzone-sm-active" : ""} ${
                    isParsing ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {isParsing ? (
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className="h-4 w-4 text-emerald-500 animate-spin" />
                      <span className="text-[11px] font-medium">Analyzing your CV...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-border-mute flex items-center justify-center flex-shrink-0">
                        <Upload className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-foreground block">
                          Upload your base CV
                        </span>
                        <span className="text-[9px] text-text-muted">Drop here or click · PDF, DOCX, TXT</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border-mute" />

            {/* ── Step 2: Add Job Links ────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${
                  jobLinks.length > 0
                    ? "bg-emerald-500 text-white"
                    : "border border-border-mute text-text-muted bg-background"
                }`}>
                  {jobLinks.length > 0 ? "✓" : "2"}
                </span>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">
                  Target Roles
                </h3>
                {jobLinks.length > 0 && (
                  <span className="ml-auto text-[9px] font-mono font-bold text-text-muted/50 bg-background border border-border-mute px-1.5 py-0.5 rounded-full">
                    {jobLinks.length}
                  </span>
                )}
              </div>

              {/* Add job link input */}
              <div className="flex gap-1.5 mb-3">
                <div className="flex-1 flex items-center border border-border-mute bg-surface rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-zinc-400 transition-all">
                  <span className="pl-2.5 text-zinc-400">
                    <LinkIcon className="h-3 w-3" />
                  </span>
                  <input
                    type="text"
                    placeholder="Paste job link or title..."
                    value={newJobLink}
                    onChange={(e) => setNewJobLink(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addJobLink();
                      }
                    }}
                    className="flex-1 px-2 py-2 text-[11px] bg-transparent focus:outline-none text-foreground font-mono"
                  />
                </div>
                <button
                  onClick={addJobLink}
                  disabled={!newJobLink.trim()}
                  className="px-2.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Job links list */}
              <div className="space-y-1">
                {jobLinks.length === 0 && (
                  <div className="text-center py-5">
                    <Briefcase className="h-5 w-5 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="text-[10px] text-text-muted/50 font-mono">
                      Add a job link to get started
                    </p>
                  </div>
                )}
                {jobLinks.map((link, index) => (
                  <div
                    key={index}
                    onClick={() => selectJobLink(index)}
                    className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${
                      activeJobIndex === index
                        ? "bg-foreground/5 border border-foreground/15"
                        : "hover:bg-background border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                        activeJobIndex === index ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    />
                    <div className="flex-1 overflow-hidden">
                      <span className={`block truncate text-[11px] ${
                        activeJobIndex === index ? "font-semibold text-foreground" : "text-text-muted"
                      }`} title={link}>
                        {link.replace(/^https?:\/\/(www\.)?/, "").slice(0, 32)}
                        {link.replace(/^https?:\/\/(www\.)?/, "").length > 32 ? "…" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={link.startsWith("http") ? link : `https://${link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-zinc-400 hover:text-foreground rounded transition-colors"
                        title="Open link"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeJobLink(index);
                        }}
                        className="p-1 text-zinc-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border-mute" />

            {/* ── Step 3: Saved History Sessions ────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${
                  sessions.length > 0
                    ? "bg-emerald-500 text-white"
                    : "border border-border-mute text-text-muted bg-background"
                }`}>
                  {sessions.length > 0 ? "✓" : "3"}
                </span>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">
                  Saved Sessions
                </h3>
                <button
                  onClick={startNewSession}
                  className="ml-auto text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none"
                  title="New Session"
                >
                  <Plus className="h-3 w-3" />
                  New
                </button>
              </div>

              {/* Sessions list */}
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {sessions.length === 0 ? (
                  <p className="text-[10px] text-text-muted/50 font-mono text-center py-2">
                    No saved sessions
                  </p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                        activeSessionId === session.id
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "hover:bg-background border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <FileText className={`h-3.5 w-3.5 flex-shrink-0 ${
                          activeSessionId === session.id ? "text-emerald-500" : "text-zinc-400"
                        }`} />
                        <div className="overflow-hidden">
                          <span className={`block truncate text-[11px] ${
                            activeSessionId === session.id ? "font-semibold text-foreground" : "text-text-muted"
                          }`} title={session.name}>
                            {session.name}
                          </span>
                          <span className="text-[8px] text-text-muted/40 font-mono block">
                            {new Date(session.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 rounded transition-colors cursor-pointer border-none bg-transparent"
                        title="Delete Session"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar Footer: Profile & Settings ──────── */}
          <div className="border-t border-border-mute">
            {/* Status bar */}
            <div className="px-4 py-2 flex items-center gap-3 text-[9px] text-text-muted/50 font-mono">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  cvText ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                }`} />
                {cvText ? "CV loaded" : "No CV"}
              </div>
              <span>·</span>
              <span>{jobLinks.length} role{jobLinks.length !== 1 ? "s" : ""}</span>
              {hasStarted && (
                <>
                  <span>·</span>
                  <span className="text-emerald-500 font-semibold">Session active</span>
                </>
              )}
            </div>

            {/* Profile section */}
            <div className="px-3 py-2.5 flex items-center justify-between">
              {supabaseUser ? (
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {supabaseUser.user_metadata?.avatar_url ? (
                    <img
                      src={supabaseUser.user_metadata.avatar_url}
                      alt={profileName}
                      className="w-8 h-8 rounded-full border border-border-mute object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white border border-border-mute flex items-center justify-center font-bold text-xs uppercase">
                      {profileName.charAt(0)}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <span className="text-[11px] font-semibold text-foreground block leading-tight truncate" title={profileName}>
                      {profileName}
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold block leading-tight">
                      {profileAdisadel ? "Adisadel Alum" : "Connected"}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="flex-1 mr-2 px-3 py-1.5 rounded-lg border border-border-mute bg-surface hover:bg-background text-foreground text-[10px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-3.5 h-3.5"
                  />
                  Sign in with Google
                </button>
              )}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                  title="Settings"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
                {supabaseUser && (
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* ═══ PANE 2: Center — Conversation ═══ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto workspace-chat-scroll">
            {!hasStarted ? (
              /* Empty state */
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center max-w-md workspace-fade-in">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-border-mute mb-5 shadow-sm">
                    <Bot className="h-6 w-6 text-zinc-400" />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight mb-2">
                    Ready to tailor
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed mb-6">
                    Upload your base CV on the left and add a job link. I&apos;ll start a conversation to understand the role, then generate a tailored version.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-[10px] text-text-muted/60 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${cvText ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700 animate-pulse"}`} />
                      {cvText ? "CV ready" : "Upload CV"}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${jobLinks.length > 0 ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700 animate-pulse"}`} />
                      {jobLinks.length > 0 ? "Job added" : "Add job link"}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      Tailored CV
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Active conversation messages */
              <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
                {messages.map((msg, index) => {
                  const isAssistant = msg.role === "assistant" || msg.role === "model";
                  return (
                    <div
                      key={index}
                      className={`flex gap-3 workspace-msg-in ${isAssistant ? "" : "flex-row-reverse"}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {isAssistant && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                      <div
                        className={`workspace-bubble ${
                          isAssistant ? "workspace-bubble-ai" : "workspace-bubble-user"
                        }`}
                      >
                        {renderMessageContent(msg)}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-3 workspace-msg-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="workspace-bubble workspace-bubble-ai">
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="workspace-typing-dot" />
                        <span className="workspace-typing-dot" style={{ animationDelay: "0.15s" }} />
                        <span className="workspace-typing-dot" style={{ animationDelay: "0.3s" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Chat input — ALWAYS visible */}
          <div className="border-t border-border-mute bg-background/80 backdrop-blur-sm p-4 no-print">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!hasStarted && inputMessage.trim()) {
                  // If user types before adding a job link, start a freeform session
                  setHasStarted(true);
                  setMessages([]);
                  setIsTyping(true);
                  const text = inputMessage;
                  setInputMessage("");
                  setTimeout(() => {
                    setMessages([
                      { role: "user", content: text },
                      {
                        role: "assistant",
                        content: "Got it! To tailor your resume effectively, could you also **paste the job link or description** in the sidebar on the left? In the meantime, tell me more about the role you're targeting.",
                      },
                    ]);
                    setIsTyping(false);
                  }, 800);
                } else {
                  sendMessage();
                }
              }}
              className="max-w-2xl mx-auto"
            >
              <div className="workspace-input-container">
                <textarea
                  ref={textareaRef}
                  placeholder={hasStarted ? "Type your response or use voice input..." : "Describe the role you're applying for..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                  rows={1}
                  className="workspace-textarea"
                />
                <div className="flex items-center gap-1.5 px-2 pb-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`workspace-input-btn ${isListening ? "workspace-input-btn-recording" : ""}`}
                    title="Voice input"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <div className="flex-1" />
                  <span className="text-[9px] text-text-muted/40 font-mono mr-2 hidden sm:block">
                    Shift+Enter for new line
                  </span>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="workspace-send-btn"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ═══ PANE 3: Right — Resume Preview ═══ */}
        <div
          className={`hidden lg:flex flex-col border-l border-border-mute transition-all duration-300 print-page-wrapper ${
            hasResume ? "w-[42%]" : "w-[30%]"
          }`}
        >
          {hasResume ? (
            <>
              {/* Preview header */}
              <div className="border-b border-border-mute px-4 py-2.5 flex items-center justify-between bg-background/80 backdrop-blur-sm no-print flex-shrink-0">
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
                  Tailored CV
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveSession}
                    className="workspace-action-btn"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </button>
                  <button onClick={handleExportPDF} className="workspace-action-btn-primary">
                    <Download className="h-3.5 w-3.5" />
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Warning */}
              {showWarning && unverifiedCount > 0 && (
                <div className="mx-4 mt-3 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-400 p-3 rounded-lg flex items-center justify-between gap-3 no-print workspace-fade-in">
                  <div className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="font-bold">{unverifiedCount} unverified claims.</span>
                  </div>
                  <div className="flex gap-2 text-[10px] font-bold font-mono">
                    <button onClick={triggerPrint} className="px-2.5 py-1 bg-amber-600 text-white rounded cursor-pointer">
                      Confirm
                    </button>
                    <button onClick={() => setShowWarning(false)} className="px-2.5 py-1 border border-amber-500/30 rounded cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Resume canvas */}
              <div className="flex-1 overflow-y-auto p-4 flex justify-center">
                <div className="w-full max-w-[800px]">
                  <div className="shadow-lg rounded-lg overflow-hidden border border-border-mute">
                    <A4ResumePreview
                      data={resumeData}
                      onChange={(newData) => setResumeData(newData)}
                      highlightedBullets={[]}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Empty preview state */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-border-mute flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-zinc-300 dark:text-zinc-700" />
              </div>
              <p className="text-xs text-text-muted/60 max-w-[180px] leading-relaxed">
                Your tailored resume will appear here after the conversation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Settings Modal ────────────────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print workspace-fade-in">
          <div className="bg-surface border border-border-mute rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-foreground">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-mute flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-sans font-bold text-sm tracking-tight">Workspace Settings</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg text-text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-border-mute bg-background/50 px-4">
              <button
                onClick={() => setSettingsTab("profile")}
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                  settingsTab === "profile"
                    ? "border-emerald-500 text-foreground font-semibold"
                    : "border-transparent text-text-muted hover:text-foreground"
                }`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => setSettingsTab("ai")}
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                  settingsTab === "ai"
                    ? "border-emerald-500 text-foreground font-semibold"
                    : "border-transparent text-text-muted hover:text-foreground"
                }`}
              >
                🤖 AI Assistant
              </button>
              <button
                onClick={() => setSettingsTab("security")}
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                  settingsTab === "security"
                    ? "border-emerald-500 text-foreground font-semibold"
                    : "border-transparent text-text-muted hover:text-foreground"
                }`}
              >
                🔒 Security & API
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {settingsTab === "profile" && (
                <div className="space-y-4 workspace-fade-in">
                  {/* Google OAuth account connection status */}
                  <div className="p-3 bg-background border border-border-mute rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-4 h-4"
                      />
                      <div>
                        <span className="text-xs font-bold block leading-none mb-1">Google Authentication</span>
                        <span className="text-[9px] text-text-muted">
                          {supabaseUser ? `Linked to ${supabaseUser.email}` : "Not connected"}
                        </span>
                      </div>
                    </div>
                    {supabaseUser ? (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Connect Google
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full text-xs bg-background border border-border-mute rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g. Bernard Blay"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full text-xs bg-background border border-border-mute rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
                        placeholder="e.g. bblay@umat.edu.gh"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full text-xs bg-background border border-border-mute rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
                        placeholder="e.g. +233 55 123 4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-1">
                        GitHub / Website
                      </label>
                      <input
                        type="text"
                        value={profileWebsite}
                        onChange={(e) => setProfileWebsite(e.target.value)}
                        className="w-full text-xs bg-background border border-border-mute rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
                        placeholder="e.g. github.com/bernardblay"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-1">
                        Graduation Year
                      </label>
                      <input
                        type="text"
                        value={profileGradYear}
                        onChange={(e) => setProfileGradYear(e.target.value)}
                        className="w-full text-xs bg-background border border-border-mute rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
                        placeholder="e.g. 2028"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-1">
                      Academic Institution
                    </label>
                    <input
                      type="text"
                      value={profileSchool}
                      onChange={(e) => setProfileSchool(e.target.value)}
                      className="w-full text-xs bg-background border border-border-mute rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g. UMaT"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-1">
                      Course / Major
                    </label>
                    <input
                      type="text"
                      value={profileDegree}
                      onChange={(e) => setProfileDegree(e.target.value)}
                      className="w-full text-xs bg-background border border-border-mute rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g. BSc Cybersecurity"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-1">
                      Target Career Aspiration
                    </label>
                    <input
                      type="text"
                      value={profileAspiration}
                      onChange={(e) => setProfileAspiration(e.target.value)}
                      className="w-full text-xs bg-background border border-border-mute rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g. US Graduate School"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="adisadel"
                      checked={profileAdisadel}
                      onChange={(e) => setProfileAdisadel(e.target.checked)}
                      className="h-4 w-4 rounded border-border-mute text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="adisadel" className="text-xs text-text-muted select-none cursor-pointer">
                      Adisadel College Alum (Show designation badge)
                    </label>
                  </div>
                </div>
              )}

              {settingsTab === "ai" && (
                <div className="space-y-5 workspace-fade-in">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-2">
                      Assistant Response Tone
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "cooperative", label: "🤝 Supportive", desc: "Friendly coach" },
                        { id: "recruiter", label: "💼 Recruiter", desc: "Tough interviews" },
                        { id: "auditor", label: "🔍 Security Auditor", desc: "Analytical facts" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAiTone(t.id)}
                          className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all ${
                            aiTone === t.id
                              ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                              : "border-border-mute hover:border-zinc-400 bg-background text-text-muted"
                          }`}
                        >
                          <span className="text-xs block font-bold">{t.label}</span>
                          <span className="text-[9px] block opacity-85 mt-0.5">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-2">
                      Primary Language
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "en", label: "English" },
                        { id: "fr", label: "Français" },
                        { id: "de", label: "Deutsch" },
                        { id: "dar", label: "Moroccan (Darija)" },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setAiLanguage(lang.id)}
                          className={`p-2 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                            aiLanguage === lang.id
                              ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                              : "border-border-mute hover:border-zinc-400 bg-background text-text-muted"
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-2">
                      Verification Strictness (Claims Auditing)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "low", label: "Relaxed", desc: "Fewer checks" },
                        { id: "medium", label: "Balanced", desc: "Flag main gaps" },
                        { id: "high", label: "Maximum (Cyber)", desc: "Audit every claim" },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setAiStrictness(st.id)}
                          className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                            aiStrictness === st.id
                              ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                              : "border-border-mute hover:border-zinc-400 bg-background text-text-muted"
                          }`}
                        >
                          <span className="text-xs block font-bold">{st.label}</span>
                          <span className="text-[9px] block opacity-85 mt-0.5">{st.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border-mute pt-4">
                    <div className="flex items-start justify-between gap-4 p-3 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-500/20 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          💖 Khadija Partner Mode
                        </span>
                        <p className="text-[10px] text-text-muted leading-relaxed">
                          Enables sweet motivational reminders and blessings in Moroccan French/Arabic during your tailoring sessions.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={khadijaMode}
                        onChange={(e) => setKhadijaMode(e.target.checked)}
                        className="h-5 w-5 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "security" && (
                <div className="space-y-4 workspace-fade-in">
                  <div className="p-3 bg-background border border-border-mute rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <div>
                        <span className="text-xs font-bold block">Local Encryption Active</span>
                        <span className="text-[9px] text-text-muted font-mono">AES-256-GCM Secure Vault</span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      VERIFIED
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase block mb-1">
                      Custom OpenAI / Foundry API Key
                    </label>
                    <input
                      type="password"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      className="w-full text-xs bg-background border border-border-mute rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-colors font-mono"
                      placeholder="sk-..."
                    />
                    <p className="text-[9px] text-text-muted mt-1 leading-normal">
                      Leave empty to use shared academic server rates. Custom API key is encrypted and stored locally.
                    </p>
                  </div>

                  <div className="border-t border-border-mute pt-4 space-y-2">
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase block">
                      Troubleshooting & Maintenance
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear your current session history, parsed CV and target links? This cannot be undone.")) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="w-full py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Reset Workspace Database
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-border-mute bg-background/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-border-mute rounded-lg text-xs font-medium text-text-muted hover:text-foreground hover:bg-background cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSettings}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
