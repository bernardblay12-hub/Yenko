"use client";

import { useState } from "react";
import { Edit2, Check, Plus, Trash2, X } from "lucide-react";

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  bullets: string[];
}

interface EducationItem {
  id: string;
  degree: string;
  school: string;
  duration: string;
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
}

interface A4ResumePreviewProps {
  data: ResumeData;
  onChange?: (updatedData: ResumeData) => void;
  highlightedBullets?: string[]; // IDs or matches to show differences
}

export default function A4ResumePreview({
  data,
  onChange,
  highlightedBullets = [],
}: A4ResumePreviewProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const startEditing = (key: string, value: string) => {
    setEditingField(key);
    setTempValue(value);
  };

  const saveEditing = (key: string) => {
    if (!onChange) return;

    const keys = key.split(".");
    const updated = { ...data };

    if (keys.length === 1) {
      // @ts-ignore
      updated[keys[0]] = tempValue;
    } else if (keys[0] === "experience" && keys.length > 2) {
      const idx = updated.experience.findIndex(item => item.id === keys[1]);
      if (idx !== -1) {
        if (keys[2] === "bullets" && keys[3] !== undefined) {
          const bulletIdx = parseInt(keys[3]);
          updated.experience[idx].bullets[bulletIdx] = tempValue;
        } else {
          // @ts-ignore
          updated.experience[idx][keys[2]] = tempValue;
        }
      }
    } else if (keys[0] === "education" && keys.length > 2) {
      const idx = updated.education.findIndex(item => item.id === keys[1]);
      if (idx !== -1) {
        // @ts-ignore
        updated.education[idx][keys[2]] = tempValue;
      }
    }

    onChange(updated);
    setEditingField(null);
  };

  const addExperienceBullet = (expId: string) => {
    if (!onChange) return;
    const updated = { ...data };
    const idx = updated.experience.findIndex(item => item.id === expId);
    if (idx !== -1) {
      updated.experience[idx].bullets.push("New achievement bullet details...");
      onChange(updated);
    }
  };

  const deleteExperienceBullet = (expId: string, bulletIdx: number) => {
    if (!onChange) return;
    const updated = { ...data };
    const idx = updated.experience.findIndex(item => item.id === expId);
    if (idx !== -1) {
      updated.experience[idx].bullets.splice(bulletIdx, 1);
      onChange(updated);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-950 text-black dark:text-zinc-100 p-8 sm:p-12 shadow-md border border-zinc-200 dark:border-zinc-800 min-h-[1050px] flex flex-col font-mono text-xs">
      {/* Header section */}
      <div className="text-center space-y-2 pb-6 border-b border-zinc-150 dark:border-zinc-800">
        {editingField === "name" ? (
          <div className="flex items-center justify-center gap-2">
            <input 
              type="text" 
              value={tempValue} 
              onChange={e => setTempValue(e.target.value)}
              className="text-2xl font-bold font-mono text-center border-b border-zinc-400 focus:outline-none dark:bg-zinc-900 px-2"
            />
            <button onClick={() => saveEditing("name")} className="p-1 text-green-600 hover:text-green-755 cursor-pointer no-print"><Check className="h-4 w-4" /></button>
            <button onClick={() => setEditingField(null)} className="p-1 text-red-600 hover:text-red-755 cursor-pointer no-print"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <h1 
            onClick={() => startEditing("name", data.name)}
            className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-white cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 py-0.5 rounded inline-block"
          >
            {data.name}
          </h1>
        )}

        <div>
          {editingField === "title" ? (
            <div className="flex items-center justify-center gap-2">
              <input 
                type="text" 
                value={tempValue} 
                onChange={e => setTempValue(e.target.value)}
                className="text-sm text-zinc-550 dark:text-zinc-400 font-medium text-center border-b border-zinc-400 focus:outline-none dark:bg-zinc-900 px-2"
              />
              <button onClick={() => saveEditing("title")} className="p-1 text-green-600 hover:text-green-700 cursor-pointer no-print"><Check className="h-3.5 w-3.5" /></button>
              <button onClick={() => setEditingField(null)} className="p-1 text-red-600 hover:text-red-700 cursor-pointer no-print"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <div 
              onClick={() => startEditing("title", data.title)}
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 py-0.5 rounded inline-block"
            >
              {data.title}
            </div>
          )}
        </div>

        {/* Contact info links */}
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 flex flex-wrap justify-center items-center gap-x-2 gap-y-1 font-mono">
          {editingField === "contact" ? (
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Email" value={data.email} onChange={e => onChange?.({...data, email: e.target.value})} className="border-b border-zinc-300 dark:bg-zinc-900 text-center px-1 text-[10px] w-32 focus:outline-none" />
              <span>•</span>
              <input type="text" placeholder="Phone" value={data.phone} onChange={e => onChange?.({...data, phone: e.target.value})} className="border-b border-zinc-300 dark:bg-zinc-900 text-center px-1 text-[10px] w-28 focus:outline-none" />
              <span>•</span>
              <input type="text" placeholder="Website" value={data.website} onChange={e => onChange?.({...data, website: e.target.value})} className="border-b border-zinc-300 dark:bg-zinc-900 text-center px-1 text-[10px] w-36 focus:outline-none" />
              <button onClick={() => setEditingField(null)} className="p-1 text-green-600 cursor-pointer"><Check className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <div 
              onClick={() => startEditing("contact", "")} 
              className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 py-0.5 rounded flex items-center gap-1.5"
            >
              <span>{data.email}</span>
              <span>•</span>
              <span>{data.phone}</span>
              <span>•</span>
              <span>{data.website}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary section */}
      <div className="mt-5">
        <h2 className="text-xs font-bold tracking-widest text-zinc-800 dark:text-zinc-200 uppercase border-b border-zinc-150 dark:border-zinc-800 pb-1 mb-2 font-mono">
          Profile Summary
        </h2>
        {editingField === "summary" ? (
          <div className="flex items-start gap-2">
            <textarea 
              value={tempValue} 
              onChange={e => setTempValue(e.target.value)}
              className="w-full text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border border-zinc-300 dark:border-zinc-700 p-2 rounded focus:outline-none dark:bg-zinc-900 min-h-[60px]"
            />
            <div className="flex flex-col gap-1 no-print">
              <button onClick={() => saveEditing("summary")} className="p-1 text-green-600 hover:text-green-700 cursor-pointer"><Check className="h-4 w-4" /></button>
              <button onClick={() => setEditingField(null)} className="p-1 text-red-600 hover:text-red-700 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
          </div>
        ) : (
          <p 
            onClick={() => startEditing("summary", data.summary)}
            className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 py-1 rounded"
          >
            {data.summary}
          </p>
        )}
      </div>

      {/* Experience section */}
      <div className="mt-6 flex-1">
        <h2 className="text-xs font-bold tracking-widest text-zinc-800 dark:text-zinc-200 uppercase border-b border-zinc-150 dark:border-zinc-800 pb-1 mb-3 font-mono">
          Professional Experience
        </h2>
        <div className="space-y-4.5">
          {data.experience.map((exp) => (
            <div key={exp.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs leading-none">
                <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  {editingField === `experience.${exp.id}.role` ? (
                    <div className="flex items-center gap-1">
                      <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className="border-b border-zinc-400 focus:outline-none dark:bg-zinc-900 px-1 font-semibold" />
                      <button onClick={() => saveEditing(`experience.${exp.id}.role`)} className="text-green-600"><Check className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <span onClick={() => startEditing(`experience.${exp.id}.role`, exp.role)} className="cursor-pointer hover:underline">{exp.role}</span>
                  )}
                  <span className="text-zinc-400 dark:text-zinc-600 font-normal">at</span>
                  {editingField === `experience.${exp.id}.company` ? (
                    <div className="flex items-center gap-1">
                      <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className="border-b border-zinc-400 focus:outline-none dark:bg-zinc-900 px-1 font-semibold" />
                      <button onClick={() => saveEditing(`experience.${exp.id}.company`)} className="text-green-600"><Check className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <span onClick={() => startEditing(`experience.${exp.id}.company`, exp.company)} className="cursor-pointer hover:underline text-zinc-700 dark:text-zinc-300">{exp.company}</span>
                  )}
                </div>
                <div className="text-zinc-500 dark:text-zinc-450 font-mono text-[9px]">
                  {editingField === `experience.${exp.id}.duration` ? (
                    <div className="flex items-center gap-1">
                      <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className="border-b border-zinc-400 focus:outline-none dark:bg-zinc-900 px-1 text-[9px] w-24" />
                      <button onClick={() => saveEditing(`experience.${exp.id}.duration`)} className="text-green-600"><Check className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <span onClick={() => startEditing(`experience.${exp.id}.duration`, exp.duration)} className="cursor-pointer hover:underline">{exp.duration}</span>
                  )}
                </div>
              </div>

              {/* Achievement bullets */}
              <ul className="list-none pl-1 space-y-1.5 text-zinc-650 dark:text-zinc-300 leading-relaxed">
                {exp.bullets.map((bullet, bIdx) => {
                  const bulletId = `${exp.id}-${bIdx}`;
                  const isHighlighted = highlightedBullets.includes(bulletId);
                  const isUnverified = bullet.includes("[unverified]");
                  const cleanBullet = bullet.replace(/\[unverified\]/g, "").trim();
                  return (
                    <li 
                      key={bIdx}
                      className={`relative group/bullet rounded px-1.5 -ml-1.5 transition-colors ${
                        isHighlighted 
                          ? "bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-350 font-medium" 
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {editingField === `experience.${exp.id}.bullets.${bIdx}` ? (
                        <div className="flex items-start gap-2 w-full font-mono">
                          <textarea 
                            value={tempValue} 
                            onChange={e => setTempValue(e.target.value)}
                            className="w-full text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border border-zinc-300 dark:border-zinc-700 p-1.5 rounded focus:outline-none dark:bg-zinc-900"
                          />
                          <div className="flex flex-col gap-1 no-print">
                            <button onClick={() => saveEditing(`experience.${exp.id}.bullets.${bIdx}`)} className="p-0.5 text-green-600 hover:text-green-700"><Check className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setEditingField(null)} className="p-0.5 text-red-600 hover:text-red-700"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4 font-mono">
                          <div className="flex items-start gap-2.5 w-full">
                            {isUnverified ? (
                              <span 
                                className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 print:hidden" 
                                title="Unverified bullet (no confirmation)"
                              />
                            ) : (
                              <span 
                                className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1.75 flex-shrink-0"
                              />
                            )}
                            <span 
                              onClick={() => startEditing(`experience.${exp.id}.bullets.${bIdx}`, bullet)}
                              className="cursor-pointer block w-full text-zinc-600 dark:text-zinc-350 hover:text-foreground transition-colors"
                            >
                              {cleanBullet}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteExperienceBullet(exp.id, bIdx)}
                            className="opacity-0 group-hover/bullet:opacity-100 p-0.5 text-zinc-400 hover:text-red-500 transition-opacity cursor-pointer no-print flex-shrink-0"
                            title="Delete bullet"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="no-print pt-1">
                <button
                  onClick={() => addExperienceBullet(exp.id)}
                  className="text-[9px] font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-250 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add achievement bullet
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Skills & Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-150 dark:border-zinc-800 pt-5 mt-6">
        {/* Skills */}
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-800 dark:text-zinc-200 uppercase border-b border-zinc-150 dark:border-zinc-800 pb-1 mb-2.5 font-mono">
            Core Expertise
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="text-[10px] font-mono bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-850"
              >
                {skill}
              </span>
            ))}
            {onChange && (
              <button
                onClick={() => {
                  const newSkill = prompt("Enter new skill:");
                  if (newSkill && newSkill.trim()) {
                    onChange({...data, skills: [...data.skills, newSkill.trim()]});
                  }
                }}
                className="text-[10px] font-mono bg-transparent text-zinc-400 px-2 py-0.5 rounded border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-650 cursor-pointer no-print"
              >
                + Add skill
              </button>
            )}
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-800 dark:text-zinc-200 uppercase border-b border-zinc-150 dark:border-zinc-800 pb-1 mb-2.5 font-mono">
            Education
          </h2>
          <div className="space-y-2">
            {data.education.map((edu) => (
              <div key={edu.id} className="text-xs leading-normal">
                <div className="flex justify-between font-mono font-semibold">
                  <span className="text-zinc-900 dark:text-white flex items-center gap-1">
                    {editingField === `education.${edu.id}.degree` ? (
                      <div className="flex items-center gap-1">
                        <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className="border-b border-zinc-400 focus:outline-none dark:bg-zinc-900 px-1 text-xs" />
                        <button onClick={() => saveEditing(`education.${edu.id}.degree`)} className="text-green-600"><Check className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <span onClick={() => startEditing(`education.${edu.id}.degree`, edu.degree)} className="cursor-pointer hover:underline">{edu.degree}</span>
                    )}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-450 font-mono text-[9px] font-normal">
                    {editingField === `education.${edu.id}.duration` ? (
                      <div className="flex items-center gap-1">
                        <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className="border-b border-zinc-400 focus:outline-none dark:bg-zinc-900 px-1 text-[9px] w-20" />
                        <button onClick={() => saveEditing(`education.${edu.id}.duration`)} className="text-green-600"><Check className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <span onClick={() => startEditing(`education.${edu.id}.duration`, edu.duration)} className="cursor-pointer hover:underline">{edu.duration}</span>
                    )}
                  </span>
                </div>
                <div className="text-zinc-550 dark:text-zinc-400 text-[10px] mt-0.5">
                  {editingField === `education.${edu.id}.school` ? (
                    <div className="flex items-center gap-1">
                      <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className="border-b border-zinc-400 focus:outline-none dark:bg-zinc-900 px-1 text-[10px] w-full" />
                      <button onClick={() => saveEditing(`education.${edu.id}.school`)} className="text-green-600"><Check className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <span onClick={() => startEditing(`education.${edu.id}.school`, edu.school)} className="cursor-pointer hover:underline">{edu.school}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
