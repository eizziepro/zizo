import React, { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../components/untitledui/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { MaskedValue } from '../components/common/MaskedValue';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { Avatar } from '../components/untitledui/Avatar';
import { Badge } from '../components/untitledui/Badge';
import { Button } from '../components/untitledui/Button';
import { Drawer } from '../components/untitledui/Drawer';
import { Modal } from '../components/untitledui/Modal';
import { Input } from '../components/untitledui/Input';
import { Select } from '../components/untitledui/Select';
import { Textarea } from '../components/untitledui/Textarea';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useNotifications } from '../context/NotificationContext';
import { useAuditLog } from '../hooks/useAuditLog';
import {
  Folder,
  Plus,
  Download01,
  CheckCircle,
  Clock,
  AlertCircle,
  Building01,
  Calendar,
  ShieldTick,
  User01,
  Heart,
  MessageDotsSquare,
  ChevronRight,
  Send01,
} from '@untitledui/icons';
import type {
  CaseRecord,
  CaseStage,
  CaseProgram,
  CaseHealthStatus,
  CaseMilestone,
  CaseNote,
} from '../types';

const STAGE_LABELS: Record<CaseStage, string> = {
  legal_intake: 'Legal & Escrow Setup',
  matching_clearance: 'Matching & Medical Clearance',
  ivf_embryo_creation: 'IVF & PGT-A Creation',
  embryo_transfer: 'Embryo Transfer',
  pregnancy_trimester_1: 'Pregnancy Trimester 1 (Heartbeat)',
  pregnancy_trimester_2_3: 'Trimester 2 & 3 Monitoring',
  delivery_citizenship: 'Delivery & Exit Clearance',
  journey_completed: 'Completed Journey',
};

const PROGRAM_LABELS: Record<CaseProgram, string> = {
  gestational_surrogacy: 'Gestational Surrogacy',
  egg_donation_ivf: 'Egg Donor & IVF',
  surrogacy_and_egg_donation: 'Full Surrogacy + Donor',
  ivf_coordination: 'Clinical IVF Coordination',
};

const INITIAL_MILESTONES_TEMPLATE: Omit<CaseMilestone, 'id'>[] = [
  { title: 'Dual-Jurisdiction Legal Scaffolding & Escrow Funded', stage: 'legal_intake', completed: true, completed_at: '2026-03-20T10:00:00Z' },
  { title: 'Surrogate Clinical & Psychological Clearance', stage: 'matching_clearance', completed: true, completed_at: '2026-05-15T12:00:00Z' },
  { title: 'Egg Donor Oocyte Retrieval & ICSI Fertilization', stage: 'ivf_embryo_creation', completed: true, completed_at: '2026-07-10T14:00:00Z' },
  { title: 'PGT-A Genetic Euploidy Screening & Cryopreservation', stage: 'ivf_embryo_creation', completed: true, completed_at: '2026-08-01T11:00:00Z' },
  { title: 'Endometrial Preparation & Embryo Transfer', stage: 'embryo_transfer', completed: true, completed_at: '2026-09-18T09:30:00Z' },
  { title: 'Positive Beta-hCG & 6-Week Ultrasound Heartbeat', stage: 'pregnancy_trimester_1', completed: true, completed_at: '2026-10-22T10:15:00Z' },
  { title: '20-Week 4D Detailed Fetal Anatomy Ultrasound', stage: 'pregnancy_trimester_2_3', completed: false, target_date: '2027-01-20' },
  { title: 'Birth Certificate, Embassy DNA & Exit Passport', stage: 'delivery_citizenship', completed: false, target_date: '2027-06-12' },
];

const INITIAL_CASES: CaseRecord[] = [
  {
    id: 'case-1',
    case_number: 'ZZ-2026-084',
    client_name: 'Olumide & Sarah A.',
    client_email: 'olumide.a@example.com',
    client_phone: '+44 7911 123456',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    country: 'United Kingdom',
    program: 'gestational_surrogacy',
    stage: 'pregnancy_trimester_1',
    health_status: 'on_track',
    progress_pct: 65,
    assigned_coordinator: {
      id: '1',
      full_name: 'Chizaram Ata',
      avatar_path: '/assets/img/founder-about-chizaram-ata-640w.webp',
    },
    partner_clinic: 'Bridge Clinic Lagos',
    matched_surrogate: {
      id: 'surr-1',
      code: 'ZZ-S-104',
      name: 'Blessing O.',
    },
    matched_donor: null,
    start_date: '2026-03-12',
    estimated_transfer_date: '2026-09-18',
    target_delivery_date: '2027-06-12',
    milestones: INITIAL_MILESTONES_TEMPLATE.map((m, idx) => ({ ...m, id: `m-1-${idx}` })),
    notes: [
      {
        id: 'n-1',
        author: 'Chizaram Ata',
        role: 'Clinical Director',
        created_at: '2026-11-18T14:30:00Z',
        text: '10-week gestational scan completed at Bridge Clinic. Fetal heartbeat robust at 168 bpm. Intended parents in London briefed via Zoom.',
        category: 'clinical',
      },
      {
        id: 'n-2',
        author: 'Amara Okafor',
        role: 'Senior Coordinator',
        created_at: '2026-10-04T09:15:00Z',
        text: 'Surrogate stipend tranche 2 disbursed via secure escrow facility. Confirmation receipt filed with UK legal team.',
        category: 'financial',
      },
    ],
    financial_status: {
      total_budget_usd: 48000,
      disbursed_usd: 31500,
      escrow_secured: true,
    },
    created_at: '2026-03-12T10:00:00Z',
    updated_at: '2026-11-18T14:30:00Z',
  },
  {
    id: 'case-2',
    case_number: 'ZZ-2026-092',
    client_name: 'David & Rachel K.',
    client_email: 'david.k@example.com',
    client_phone: '+1 416 555 0192',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    country: 'Canada',
    program: 'surrogacy_and_egg_donation',
    stage: 'embryo_transfer',
    health_status: 'pending_clinical',
    progress_pct: 50,
    assigned_coordinator: {
      id: '2',
      full_name: 'Amara Okafor',
      avatar_path: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&q=80',
    },
    partner_clinic: 'Nordica Fertility Centre Lagos',
    matched_surrogate: {
      id: 'surr-2',
      code: 'ZZ-S-108',
      name: 'Ngozi D.',
    },
    matched_donor: {
      id: 'don-1',
      code: 'ZZ-D-218',
      name: 'Chioma E.',
    },
    start_date: '2026-05-02',
    estimated_transfer_date: '2026-11-28',
    target_delivery_date: '2027-08-20',
    milestones: [
      { id: 'm-2-0', title: 'Canadian Legal Advisory & Dual Agreement', stage: 'legal_intake', completed: true, completed_at: '2026-05-18T10:00:00Z' },
      { id: 'm-2-1', title: 'Egg Donor Chioma E. Selection & Hormonal Cycle', stage: 'matching_clearance', completed: true, completed_at: '2026-07-22T10:00:00Z' },
      { id: 'm-2-2', title: 'ICSI Fertilization & 4 Grade-A Blastocysts', stage: 'ivf_embryo_creation', completed: true, completed_at: '2026-09-05T10:00:00Z' },
      { id: 'm-2-3', title: 'Surrogate Endometrial Lining Scan (Target >= 8.5mm)', stage: 'embryo_transfer', completed: false, target_date: '2026-11-25' },
      { id: 'm-2-4', title: 'Frozen Embryo Transfer Scheduled', stage: 'embryo_transfer', completed: false, target_date: '2026-11-28' },
    ],
    notes: [
      {
        id: 'n-21',
        author: 'Amara Okafor',
        role: 'Senior Coordinator',
        created_at: '2026-11-15T11:00:00Z',
        text: 'Surrogate Ngozi reported for mid-cycle ultrasound. Endometrial thickness measured at 8.1mm with good triple-line pattern. Transfer confirmed for Nov 28.',
        category: 'clinical',
      },
    ],
    financial_status: {
      total_budget_usd: 52000,
      disbursed_usd: 26000,
      escrow_secured: true,
    },
    created_at: '2026-05-02T11:30:00Z',
    updated_at: '2026-11-15T11:00:00Z',
  },
  {
    id: 'case-3',
    case_number: 'ZZ-2026-105',
    client_name: 'Claire & Marcus T.',
    client_email: 'claire.t@example.com',
    client_phone: '+44 7455 987654',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    country: 'United Kingdom',
    program: 'egg_donation_ivf',
    stage: 'ivf_embryo_creation',
    health_status: 'on_track',
    progress_pct: 35,
    assigned_coordinator: {
      id: '1',
      full_name: 'Chizaram Ata',
      avatar_path: '/assets/img/founder-about-chizaram-ata-640w.webp',
    },
    partner_clinic: 'St. Jude Fertility Clinic Lagos',
    matched_surrogate: null,
    matched_donor: {
      id: 'don-2',
      code: 'ZZ-D-224',
      name: 'Kemi B.',
    },
    start_date: '2026-08-10',
    estimated_transfer_date: '2027-01-15',
    milestones: [
      { id: 'm-3-0', title: 'Donor Profiling & Infectious Disease Screening', stage: 'matching_clearance', completed: true, completed_at: '2026-09-12T10:00:00Z' },
      { id: 'm-3-1', title: 'Oocyte Retrieval (14 mature eggs retrieved)', stage: 'ivf_embryo_creation', completed: true, completed_at: '2026-11-02T10:00:00Z' },
      { id: 'm-3-2', title: 'PGT-A Biopsy & Next-Gen Sequencing', stage: 'ivf_embryo_creation', completed: false, target_date: '2026-11-30' },
      { id: 'm-3-3', title: 'Intended Mother Uterine Preparation & Transfer', stage: 'embryo_transfer', completed: false, target_date: '2027-01-15' },
    ],
    notes: [
      {
        id: 'n-31',
        author: 'Chizaram Ata',
        role: 'Clinical Director',
        created_at: '2026-11-04T16:00:00Z',
        text: 'Successful egg retrieval: 14 MII oocytes, 11 successfully fertilized via ICSI. Biopsies dispatched to genetics partner for PGT-A chromosomal testing.',
        category: 'clinical',
      },
    ],
    financial_status: {
      total_budget_usd: 19500,
      disbursed_usd: 9000,
      escrow_secured: true,
    },
    created_at: '2026-08-10T14:00:00Z',
    updated_at: '2026-11-04T16:00:00Z',
  },
  {
    id: 'case-4',
    case_number: 'ZZ-2026-071',
    client_name: 'Dr. Amina & Ibrahim B.',
    client_email: 'amina.b@example.com',
    client_phone: '+234 802 345 6789',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    country: 'Nigeria',
    program: 'gestational_surrogacy',
    stage: 'delivery_citizenship',
    health_status: 'on_track',
    progress_pct: 90,
    assigned_coordinator: {
      id: '2',
      full_name: 'Amara Okafor',
      avatar_path: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&q=80',
    },
    partner_clinic: 'Bridge Clinic Lagos',
    matched_surrogate: {
      id: 'surr-3',
      code: 'ZZ-S-099',
      name: 'Faith M.',
    },
    matched_donor: null,
    start_date: '2026-01-10',
    estimated_transfer_date: '2026-04-05',
    target_delivery_date: '2026-12-14',
    milestones: [
      { id: 'm-4-0', title: 'Legal & Clinic Enrollment', stage: 'legal_intake', completed: true, completed_at: '2026-01-20T10:00:00Z' },
      { id: 'm-4-1', title: 'Surrogate Clinical Clearance & Matching', stage: 'matching_clearance', completed: true, completed_at: '2026-02-28T10:00:00Z' },
      { id: 'm-4-2', title: 'Successful Embryo Transfer (Single Blastocyst)', stage: 'embryo_transfer', completed: true, completed_at: '2026-04-05T10:00:00Z' },
      { id: 'm-4-3', title: 'Trimester 1 & 2 Obstetrics Clear', stage: 'pregnancy_trimester_2_3', completed: true, completed_at: '2026-09-10T10:00:00Z' },
      { id: 'm-4-4', title: 'Week 36 Pre-Delivery Obstetric Assessment', stage: 'delivery_citizenship', completed: true, completed_at: '2026-11-12T10:00:00Z' },
      { id: 'm-4-5', title: 'Delivery at Lagoon Hospital & Birth Certification', stage: 'delivery_citizenship', completed: false, target_date: '2026-12-14' },
    ],
    notes: [
      {
        id: 'n-41',
        author: 'Amara Okafor',
        role: 'Senior Coordinator',
        created_at: '2026-11-12T15:00:00Z',
        text: 'Surrogate Faith attended 36-week assessment. Cephalic presentation confirmed, estimated fetal weight 2.8kg. Hospital pre-admission pack finalized.',
        category: 'coordination',
      },
    ],
    financial_status: {
      total_budget_usd: 44000,
      disbursed_usd: 39500,
      escrow_secured: true,
    },
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-11-12T15:00:00Z',
  },
  {
    id: 'case-5',
    case_number: 'ZZ-2026-114',
    client_name: 'Elena & George V.',
    client_email: 'elena.v@example.com',
    client_phone: '+1 212 555 4321',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    country: 'United States',
    program: 'gestational_surrogacy',
    stage: 'legal_intake',
    health_status: 'action_required',
    progress_pct: 15,
    assigned_coordinator: {
      id: '1',
      full_name: 'Chizaram Ata',
      avatar_path: '/assets/img/founder-about-chizaram-ata-640w.webp',
    },
    partner_clinic: 'Care Fertility & Lagos Partner',
    matched_surrogate: null,
    matched_donor: null,
    start_date: '2026-11-01',
    milestones: [
      { id: 'm-5-0', title: 'Consultation & Retainer Agreement', stage: 'legal_intake', completed: true, completed_at: '2026-11-05T10:00:00Z' },
      { id: 'm-5-1', title: 'Dual-Jurisdiction Escrow Trust Agreement Signature', stage: 'legal_intake', completed: false, target_date: '2026-11-25' },
      { id: 'm-5-2', title: 'Surrogate Profile Presentation & Matching', stage: 'matching_clearance', completed: false, target_date: '2026-12-15' },
    ],
    notes: [
      {
        id: 'n-51',
        author: 'Chizaram Ata',
        role: 'Clinical Director',
        created_at: '2026-11-16T17:30:00Z',
        text: 'Action required: US counsel requested clarification on clause 7.2 of Nigerian legal contract. Response dispatched today. Awaiting client return signature.',
        category: 'legal',
      },
    ],
    financial_status: {
      total_budget_usd: 54000,
      disbursed_usd: 6000,
      escrow_secured: false,
    },
    created_at: '2026-11-01T10:00:00Z',
    updated_at: '2026-11-16T17:30:00Z',
  },
  {
    id: 'case-6',
    case_number: 'ZZ-2025-042',
    client_name: 'Tariq & Yasmin H.',
    client_email: 'tariq.h@example.com',
    client_phone: '+971 50 123 4567',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    country: 'United Arab Emirates',
    program: 'surrogacy_and_egg_donation',
    stage: 'journey_completed',
    health_status: 'completed',
    progress_pct: 100,
    assigned_coordinator: {
      id: '2',
      full_name: 'Amara Okafor',
      avatar_path: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&q=80',
    },
    partner_clinic: 'Bridge Clinic Lagos',
    matched_surrogate: {
      id: 'surr-4',
      code: 'ZZ-S-081',
      name: 'Grace U.',
    },
    matched_donor: {
      id: 'don-3',
      code: 'ZZ-D-190',
      name: 'Adaobi N.',
    },
    start_date: '2025-06-15',
    target_delivery_date: '2026-05-10',
    milestones: [
      { id: 'm-6-0', title: 'Legal Scaffolding & Escrow Funded', stage: 'legal_intake', completed: true, completed_at: '2025-07-01T10:00:00Z' },
      { id: 'm-6-1', title: 'Embryo Transfer & Pregnancy Confirmation', stage: 'embryo_transfer', completed: true, completed_at: '2025-09-10T10:00:00Z' },
      { id: 'm-6-2', title: 'Healthy Delivery of Baby Boy Zayn', stage: 'delivery_citizenship', completed: true, completed_at: '2026-05-08T10:00:00Z' },
      { id: 'm-6-3', title: 'DNA Verification & Embassy Passport Clearance', stage: 'delivery_citizenship', completed: true, completed_at: '2026-07-14T10:00:00Z' },
      { id: 'm-6-4', title: 'Family Safely Returned to Dubai · Case Closed', stage: 'journey_completed', completed: true, completed_at: '2026-08-01T10:00:00Z' },
    ],
    notes: [
      {
        id: 'n-61',
        author: 'Amara Okafor',
        role: 'Senior Coordinator',
        created_at: '2026-08-01T12:00:00Z',
        text: 'Final escrow reconciliation complete. Baby Zayn and parents safely back home in Dubai. Intended parents left a verified 5-star review.',
        category: 'coordination',
      },
    ],
    financial_status: {
      total_budget_usd: 50000,
      disbursed_usd: 50000,
      escrow_secured: true,
    },
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2026-08-01T12:00:00Z',
  },
];

export const CasesPage: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [cases, setCases] = useState<CaseRecord[]>(() => {
    try {
      const stored = localStorage.getItem('zizo_cases_data');
      return stored ? JSON.parse(stored) : INITIAL_CASES;
    } catch {
      return INITIAL_CASES;
    }
  });

  const saveCases = (updated: CaseRecord[]) => {
    setCases(updated);
    try {
      localStorage.setItem('zizo_cases_data', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save cases to storage', e);
    }
  };

  const [activeTab, setActiveTab] = useState<'all' | CaseProgram | 'pregnancies' | 'completed'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<CaseRecord | null>(null);

  // New Note state inside drawer
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'clinical' | 'legal' | 'coordination' | 'financial'>('clinical');

  // New Case form state
  const [newCaseNumber, setNewCaseNumber] = useState(`ZZ-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newCountry, setNewCountry] = useState('United Kingdom');
  const [newProgram, setNewProgram] = useState<CaseProgram>('gestational_surrogacy');
  const [newStage, setNewStage] = useState<CaseStage>('legal_intake');
  const [newClinic, setNewClinic] = useState('Bridge Clinic Lagos');
  const [newCoordinator, setNewCoordinator] = useState('Chizaram Ata');
  const [newSurrogateCode, setNewSurrogateCode] = useState('');
  const [newDonorCode, setNewDonorCode] = useState('');
  const [newBudget, setNewBudget] = useState('48000');

  // KPI Calculations
  const stats = useMemo(() => {
    const total = cases.length;
    const transferPhase = cases.filter((c) => c.stage === 'embryo_transfer' || c.stage === 'ivf_embryo_creation').length;
    const pregnancies = cases.filter((c) => c.stage === 'pregnancy_trimester_1' || c.stage === 'pregnancy_trimester_2_3').length;
    const completed = cases.filter((c) => c.stage === 'journey_completed').length;
    return { total, transferPhase, pregnancies, completed };
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Tab filter
      if (activeTab === 'pregnancies') {
        if (c.stage !== 'pregnancy_trimester_1' && c.stage !== 'pregnancy_trimester_2_3') return false;
      } else if (activeTab === 'completed') {
        if (c.stage !== 'journey_completed') return false;
      } else if (activeTab !== 'all') {
        if (c.program !== activeTab) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && c.health_status !== statusFilter) return false;

      return true;
    });
  }, [cases, activeTab, statusFilter]);

  // Toggle milestone completion
  const handleToggleMilestone = (caseId: string, milestoneId: string) => {
    const updated = cases.map((c) => {
      if (c.id !== caseId) return c;
      const updatedMilestones = c.milestones.map((m) => {
        if (m.id !== milestoneId) return m;
        const nextCompleted = !m.completed;
        return {
          ...m,
          completed: nextCompleted,
          completed_at: nextCompleted ? new Date().toISOString() : null,
        };
      });

      const completedCount = updatedMilestones.filter((m) => m.completed).length;
      const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

      return {
        ...c,
        milestones: updatedMilestones,
        progress_pct: newProgress,
        updated_at: new Date().toISOString(),
      };
    });

    saveCases(updated);
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(updated.find((c) => c.id === caseId) || null);
    }
    toast('Milestone Updated', 'Case progress percentage recalculated.', 'success');
  };

  // Add clinical/coordination note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNoteText.trim()) return;

    const newNote: CaseNote = {
      id: `note-${Date.now()}`,
      author: 'Chizaram Ata',
      role: 'Clinical Director',
      created_at: new Date().toISOString(),
      text: newNoteText.trim(),
      category: newNoteCategory,
    };

    const updated = cases.map((c) => {
      if (c.id !== selectedCase.id) return c;
      return {
        ...c,
        notes: [newNote, ...c.notes],
        updated_at: new Date().toISOString(),
      };
    });

    saveCases(updated);
    setSelectedCase(updated.find((c) => c.id === selectedCase.id) || null);
    setNewNoteText('');
    toast('Note Recorded', 'Clinical update added to case dossier.', 'info');
  };

  // Create new case
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newCase: CaseRecord = {
      id: `case-${Date.now()}`,
      case_number: newCaseNumber,
      client_name: newClientName.trim(),
      client_email: newClientEmail.trim() || 'client@example.com',
      client_phone: newClientPhone.trim() || '+234 800 000 0000',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      country: newCountry,
      program: newProgram,
      stage: newStage,
      health_status: 'on_track',
      progress_pct: 15,
      assigned_coordinator: {
        id: '1',
        full_name: newCoordinator,
        avatar_path: '/assets/img/founder-about-chizaram-ata-640w.webp',
      },
      partner_clinic: newClinic,
      matched_surrogate: newSurrogateCode ? { id: `surr-${Date.now()}`, code: newSurrogateCode, name: 'Surrogate Candidate' } : null,
      matched_donor: newDonorCode ? { id: `don-${Date.now()}`, code: newDonorCode, name: 'Donor Candidate' } : null,
      start_date: new Date().toISOString().split('T')[0],
      milestones: INITIAL_MILESTONES_TEMPLATE.map((m, idx) => ({
        ...m,
        id: `m-new-${idx}`,
        completed: idx === 0,
        completed_at: idx === 0 ? new Date().toISOString() : null,
      })),
      notes: [
        {
          id: `note-init-${Date.now()}`,
          author: newCoordinator,
          role: 'Coordinator',
          created_at: new Date().toISOString(),
          text: `Case onboarded into Zizo portal for ${newClientName}. Program: ${PROGRAM_LABELS[newProgram]}. Initial legal review in progress.`,
          category: 'coordination',
        },
      ],
      financial_status: {
        total_budget_usd: Number(newBudget) || 45000,
        disbursed_usd: 5000,
        escrow_secured: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveCases([newCase, ...cases]);
    setIsNewCaseModalOpen(false);
    resetNewCaseForm();
    toast('Case Created', `Case ${newCase.case_number} registered successfully.`, 'success');
  };

  const resetNewCaseForm = () => {
    setNewCaseNumber(`ZZ-2026-${Math.floor(100 + Math.random() * 900)}`);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewSurrogateCode('');
    setNewDonorCode('');
  };

  // Delete case
  const handleDeleteCase = () => {
    if (!caseToDelete) return;
    const updated = cases.filter((c) => c.id !== caseToDelete.id);
    saveCases(updated);
    setCaseToDelete(null);
    if (selectedCase?.id === caseToDelete.id) setSelectedCase(null);
    toast('Case Removed', `Case ${caseToDelete.case_number} was deleted.`, 'info');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = 'Case ID,Client Name,Country,Program,Stage,Progress %,Health Status,Coordinator,Partner Clinic,Total Budget USD\n';
    const rows = filteredCases
      .map(
        (c) =>
          `"${c.case_number}","${c.client_name}","${c.country}","${PROGRAM_LABELS[c.program]}","${STAGE_LABELS[c.stage]}",${c.progress_pct}%,"${c.health_status}","${c.assigned_coordinator.full_name}","${c.partner_clinic}",$${c.financial_status.total_budget_usd}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zizo-cases-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Export Ready', 'Cases CSV exported successfully.', 'success');
  };

  const getHealthBadge = (status: CaseHealthStatus) => {
    switch (status) {
      case 'on_track':
        return <Badge variant="success" size="sm">On Track</Badge>;
      case 'pending_clinical':
        return <Badge variant="warning" size="sm">Pending Clinical</Badge>;
      case 'action_required':
        return <Badge variant="error" size="sm">Action Required</Badge>;
      case 'completed':
        return <Badge variant="brand" size="sm">Completed</Badge>;
      case 'paused':
        return <Badge variant="gray" size="sm">Paused</Badge>;
    }
  };

  const columns = useMemo<ColumnDef<CaseRecord, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 accent-[#17645F]"
            aria-label="Select all cases"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 accent-[#17645F]"
            aria-label="Select case row"
          />
        ),
      },
      {
        accessorKey: 'case_number',
        header: 'Case ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-[#E2ECEB] text-[#17645F] border border-[#C5D8D7] whitespace-nowrap inline-block">
            {row.original.case_number}
          </span>
        ),
      },
      {
        accessorKey: 'client_name',
        header: 'Intended Parents',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-2.5 whitespace-nowrap">
              <Avatar src={c.avatar_url || undefined} name={c.client_name} size="sm" />
              <div>
                <p className="font-semibold text-sm text-[#17191A] whitespace-nowrap">{c.client_name}</p>
                <div className="text-xs text-[#5D5E5F]">
                  <MaskedValue value={c.client_email} type="email" tableName="cases" recordId={c.id} />
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'country',
        header: 'Country',
        cell: ({ row }) => (
          <span className="text-xs font-medium text-[#2E3031] whitespace-nowrap">
            {row.original.country}
          </span>
        ),
      },
      {
        accessorKey: 'program',
        header: 'Program Path',
        cell: ({ row }) => (
          <Badge variant="brand" size="sm">
            {PROGRAM_LABELS[row.original.program]}
          </Badge>
        ),
      },
      {
        accessorKey: 'stage',
        header: 'Journey & Stage Progression',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="space-y-1 min-w-[150px] max-w-[210px]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#17191A] truncate" title={STAGE_LABELS[c.stage]}>
                  {STAGE_LABELS[c.stage]}
                </span>
                <span className="font-mono text-[11px] text-[#17645F] font-semibold">{c.progress_pct}%</span>
              </div>
              <div className="h-2 w-full bg-[#E1E0DD] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    c.health_status === 'action_required'
                      ? 'bg-[#D92D20]'
                      : c.health_status === 'pending_clinical'
                      ? 'bg-[#F79009]'
                      : c.progress_pct === 100
                      ? 'bg-[#2E7D32]'
                      : 'bg-[#17645F]'
                  }`}
                  style={{ width: `${c.progress_pct}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'partner_clinic',
        header: 'Clinic & Coordinator',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="text-xs space-y-0.5 whitespace-nowrap">
              <div className="flex items-center gap-1.5 text-[#17191A] font-medium">
                <Building01 className="w-3.5 h-3.5 text-[#8BB2AF]" />
                <span>{c.partner_clinic}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#5D5E5F]">
                <User01 className="w-3.5 h-3.5 text-[#8BB2AF]" />
                <span>{c.assigned_coordinator.full_name}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="text-right">
              <RowActionsMenu
                rowLabel={`case ${c.case_number}`}
                items={[
                  {
                    id: 'view',
                    label: 'View Case Dossier',
                    icon: <Folder className="w-4 h-4" />,
                    onClick: () => setSelectedCase(c),
                  },
                  {
                    id: 'quick-status',
                    label: c.health_status === 'on_track' ? 'Flag Clinical Review' : 'Mark On Track',
                    onClick: () => {
                      const nextStatus = c.health_status === 'on_track' ? 'pending_clinical' : 'on_track';
                      const updated = cases.map((item) => (item.id === c.id ? { ...item, health_status: nextStatus } : item));
                      saveCases(updated);
                      toast('Status Updated', `Case ${c.case_number} status set to ${nextStatus}.`, 'info');
                    },
                  },
                  {
                    id: 'delete',
                    label: 'Delete Case Record',
                    destructive: true,
                    dividerAbove: true,
                    onClick: () => setCaseToDelete(c),
                  },
                ]}
              />
            </div>
          );
        },
      },
    ],
    [cases]
  );

  return (
    <div className="space-y-6 w-full text-left">
      {/* Page Header */}
      <PageHeader
        title="Cases Management"
        description="Cross-border fertility journey coordination, gestational milestones, surrogate and donor linkages, and dual-jurisdiction citizenship tracking."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="md" iconLeading={<Download01 className="w-4 h-4" />} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button variant="primary" size="md" iconLeading={<Plus className="w-4 h-4" />} onClick={() => setIsNewCaseModalOpen(true)}>
              New Case
            </Button>
          </div>
        }
      />

      {/* Metric KPI Cards (4 cols) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="p-5 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs space-y-1">
          <p className="text-xs font-medium text-[#5D5E5F]">Active Family Journeys</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-[#17191A] font-heading">{stats.total}</p>
            <Badge variant="brand" size="sm">Active</Badge>
          </div>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs space-y-1">
          <p className="text-xs font-medium text-[#5D5E5F]">Embryo &amp; Transfer Phase</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-[#17645F] font-heading">{stats.transferPhase}</p>
            <Badge variant="gray" size="sm">Clinical</Badge>
          </div>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs space-y-1">
          <p className="text-xs font-medium text-[#5D5E5F]">Confirmed Gestational Pregnancies</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-[#2E7D32] font-heading">{stats.pregnancies}</p>
            <Badge variant="success" size="sm">Heartbeat Confirmed</Badge>
          </div>
        </div>

        <div className="p-5 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs space-y-1">
          <p className="text-xs font-medium text-[#5D5E5F]">Completed Family Journeys</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-[#17191A] font-heading">{stats.completed}</p>
            <span className="text-xs text-[#2E7D32] font-medium">Safely Home</span>
          </div>
        </div>
      </div>

      {/* Program Tabs */}
      <div className="border-b border-[#E1E0DD] overflow-x-auto">
        <nav className="flex gap-2 min-w-max" aria-label="Case filter tabs">
          {[
            { id: 'all', label: `All Cases (${cases.length})` },
            { id: 'gestational_surrogacy', label: 'Gestational Surrogacy' },
            { id: 'egg_donation_ivf', label: 'Egg Donor & IVF' },
            { id: 'surrogacy_and_egg_donation', label: 'Full Surrogacy + Donor' },
            { id: 'pregnancies', label: `Active Pregnancies (${stats.pregnancies})` },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#17645F] text-[#17645F] font-semibold'
                  : 'border-transparent text-[#5D5E5F] hover:text-[#17191A] hover:border-[#C8C7C5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Cases Data Table */}
      <DataTable
        data={filteredCases}
        columns={columns}
        searchPlaceholder="Search cases by ID, parents, country, or clinic..."
        onRowClick={(c) => setSelectedCase(c)}
        filterBar={
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Health Statuses' },
                { value: 'on_track', label: 'On Track' },
                { value: 'pending_clinical', label: 'Pending Clinical' },
                { value: 'action_required', label: 'Action Required' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>
        }
      />

      {/* Case Details Slide-Over Drawer */}
      <Drawer
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        width="2xl"
        title={selectedCase ? `${selectedCase.case_number} · ${selectedCase.client_name}` : 'Case Dossier'}
        description={selectedCase ? `${PROGRAM_LABELS[selectedCase.program]} · Partnered with ${selectedCase.partner_clinic}` : ''}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-[#5D5E5F]">
              Inception: <strong>{selectedCase?.start_date}</strong>
            </span>
            <Button variant="secondary" size="sm" onClick={() => setSelectedCase(null)}>
              Close Dossier
            </Button>
          </div>
        }
      >
        {selectedCase && (
          <div className="space-y-6 text-left">
            {/* Top Progress & Health Status Banner */}
            <div className="p-5 rounded-[10px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-sm font-bold text-[#17645F] px-2 py-0.5 rounded bg-[#E2ECEB] border border-[#C5D8D7] whitespace-nowrap">
                    {selectedCase.case_number}
                  </span>
                  <Badge variant="brand" size="sm">{PROGRAM_LABELS[selectedCase.program]}</Badge>
                  {getHealthBadge(selectedCase.health_status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5D5E5F]">Health Status:</span>
                  <select
                    value={selectedCase.health_status}
                    onChange={(e) => {
                      const nextStatus = e.target.value as CaseHealthStatus;
                      const updated = cases.map((item) => (item.id === selectedCase.id ? { ...item, health_status: nextStatus } : item));
                      saveCases(updated);
                      setSelectedCase({ ...selectedCase, health_status: nextStatus });
                      toast('Health Status Updated', `Case ${selectedCase.case_number} marked as ${nextStatus.replace('_', ' ')}.`, 'success');
                    }}
                    className="rounded border border-[#E1E0DD] bg-white px-2 py-1 text-xs text-[#17191A] font-medium focus:outline-none focus:ring-1 focus:ring-[#17645F] cursor-pointer"
                  >
                    <option value="on_track">🟢 On Track</option>
                    <option value="pending_clinical">🟠 Pending Clinical</option>
                    <option value="action_required">🔴 Action Required</option>
                    <option value="completed">🔵 Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#17191A]">{STAGE_LABELS[selectedCase.stage]}</span>
                  <span className="font-mono text-sm font-bold text-[#17645F]">{selectedCase.progress_pct}% Completed</span>
                </div>
                <div className="h-3 w-full bg-[#E1E0DD] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#17645F] transition-all duration-500"
                    style={{ width: `${selectedCase.progress_pct}%` }}
                  />
                </div>
              </div>

              {selectedCase.target_delivery_date && (
                <div className="flex items-center gap-2 text-xs text-[#17645F] font-semibold pt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Expected Due Date (EDD): {selectedCase.target_delivery_date}</span>
                </div>
              )}
            </div>

            {/* Interactive Milestones Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#17191A] uppercase tracking-wider">
                  Clinical &amp; Legal Journey Milestones
                </h3>
                <span className="text-xs text-[#5D5E5F]">Click checkbox to toggle milestone</span>
              </div>

              <div className="divide-y divide-[#E1E0DD] border border-[#E1E0DD] rounded-[10px] bg-white overflow-hidden shadow-xs">
                {selectedCase.milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(selectedCase.id, m.id)}
                    className={`p-3.5 flex items-start gap-3.5 transition-colors cursor-pointer hover:bg-[#FAF9F6] ${
                      m.completed ? 'bg-white' : 'bg-[#FAF9F6]/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={m.completed}
                      onChange={() => {}} // handled by parent div
                      className="mt-0.5 w-4 h-4 accent-[#17645F] shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 space-y-0.5">
                      <p className={`text-xs font-semibold ${m.completed ? 'text-[#17191A]' : 'text-[#5D5E5F]'}`}>
                        {idx + 1}. {m.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#969594]">
                        {m.completed && m.completed_at ? (
                          <span className="text-[#2E7D32] font-medium">
                            ✓ Completed on {new Date(m.completed_at).toLocaleDateString('en-GB')}
                          </span>
                        ) : m.target_date ? (
                          <span>Target: {m.target_date}</span>
                        ) : (
                          <span>Upcoming stage</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Linkages & Escrow Summary (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Matched Profiles & Clinical Linkages */}
              <div className="p-4 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs space-y-3">
                <h4 className="font-semibold text-[#17191A] uppercase tracking-wider text-[11px]">
                  Matched Profiles &amp; Clinic
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5D5E5F]">Partner Clinic:</span>
                    <span className="font-semibold text-[#17191A]">{selectedCase.partner_clinic}</span>
                  </div>
                  {selectedCase.matched_surrogate ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[#5D5E5F]">Gestational Surrogate:</span>
                      <span className="font-medium text-[#17645F] bg-[#E2ECEB]/50 px-2 py-0.5 rounded border border-[#C5D8D7]">
                        {selectedCase.matched_surrogate.name} ({selectedCase.matched_surrogate.code})
                      </span>
                    </div>
                  ) : null}
                  {selectedCase.matched_donor ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[#5D5E5F]">Egg Donor:</span>
                      <span className="font-medium text-[#17645F] bg-[#E2ECEB]/50 px-2 py-0.5 rounded border border-[#C5D8D7]">
                        {selectedCase.matched_donor.name} ({selectedCase.matched_donor.code})
                      </span>
                    </div>
                  ) : null}
                  {!selectedCase.matched_surrogate && !selectedCase.matched_donor && (
                    <div className="p-2 rounded bg-[#FAF9F6] border border-[#E1E0DD] text-[#5D5E5F] italic text-center">
                      Matching in progress with clinical team
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E1E0DD]/60">
                    <span className="text-[#5D5E5F]">Lead Coordinator:</span>
                    <span className="font-medium text-[#17191A]">{selectedCase.assigned_coordinator.full_name}</span>
                  </div>
                </div>
              </div>

              {/* Financial Escrow Health */}
              <div className="p-4 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs space-y-3">
                <h4 className="font-semibold text-[#17191A] uppercase tracking-wider text-[11px]">
                  Escrow &amp; Financial Governance
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5D5E5F]">Total Case Budget:</span>
                    <span className="font-semibold text-[#17191A]">${selectedCase.financial_status.total_budget_usd.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5D5E5F]">Disbursed to Date:</span>
                    <span className="font-medium text-[#2E7D32]">${selectedCase.financial_status.disbursed_usd.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5D5E5F]">Escrow Status:</span>
                    <span className="inline-flex items-center gap-1 text-[#2E7D32] font-semibold">
                      <ShieldTick className="w-3.5 h-3.5 text-[#2E7D32]" />
                      Trust Secured
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical & Coordination Notes Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-[#17191A] uppercase tracking-wider">
                Clinical &amp; Coordination Log
              </h3>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-3 p-4 rounded-[10px] bg-[#FAF9F6] border border-[#E1E0DD]">
                <Textarea
                  label="Add Coordinator Update or Clinical Note"
                  rows={2}
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record ultrasound scan result, legal update, or parent consultation..."
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#5D5E5F]">Category:</span>
                    <select
                      value={newNoteCategory}
                      onChange={(e) => setNewNoteCategory(e.target.value as any)}
                      className="border border-[#E1E0DD] rounded-[6px] px-2 py-1 text-xs bg-white text-[#17191A] focus:outline-none focus:ring-1 focus:ring-[#17645F]"
                    >
                      <option value="clinical">Clinical</option>
                      <option value="legal">Legal</option>
                      <option value="coordination">Coordination</option>
                      <option value="financial">Financial</option>
                    </select>
                  </div>
                  <Button type="submit" size="sm" iconLeading={<Send01 className="w-3.5 h-3.5" />}>
                    Post Update
                  </Button>
                </div>
              </form>

              {/* Notes Feed */}
              <div className="space-y-3">
                {selectedCase.notes.map((n) => (
                  <div key={n.id} className="p-4 rounded-[10px] bg-white border border-[#E1E0DD] shadow-2xs space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#5D5E5F]">
                      <div className="flex items-center gap-2">
                        <strong className="text-[#17191A] font-semibold">{n.author}</strong>
                        <span>({n.role})</span>
                        <span className="px-1.5 py-0.2 rounded uppercase font-mono text-[10px] bg-[#E2ECEB] text-[#17645F]">
                          {n.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#969594]">{new Date(n.created_at).toLocaleString('en-GB')}</span>
                    </div>
                    <p className="text-[#2E3031] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Case Modal */}
      <Modal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        title="Register New Case Journey"
        description="Onboard an intended parent or couple into active clinical coordination and milestone tracking."
      >
        <form onSubmit={handleCreateCase} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Case Number"
              required
              value={newCaseNumber}
              onChange={(e) => setNewCaseNumber(e.target.value)}
            />
            <Input
              label="Intended Parents / Client Name"
              required
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="e.g. Ade &amp; Folake M."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Client Email Address"
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              placeholder="parents@example.com"
            />
            <Input
              label="Client Phone / WhatsApp"
              type="tel"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              placeholder="+44 7000 000000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Client Country of Residence"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              options={[
                { value: 'United Kingdom', label: 'United Kingdom' },
                { value: 'Nigeria', label: 'Nigeria' },
                { value: 'Canada', label: 'Canada' },
                { value: 'United States', label: 'United States' },
                { value: 'United Arab Emirates', label: 'United Arab Emirates' },
                { value: 'Australia', label: 'Australia' },
              ]}
            />
            <Select
              label="Program Pathway"
              value={newProgram}
              onChange={(e) => setNewProgram(e.target.value as any)}
              options={[
                { value: 'gestational_surrogacy', label: 'Gestational Surrogacy' },
                { value: 'egg_donation_ivf', label: 'Egg Donor & IVF' },
                { value: 'surrogacy_and_egg_donation', label: 'Full Surrogacy + Egg Donor' },
                { value: 'ivf_coordination', label: 'Clinical IVF Coordination' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Partner Fertility Clinic"
              value={newClinic}
              onChange={(e) => setNewClinic(e.target.value)}
              options={[
                { value: 'Bridge Clinic Lagos', label: 'Bridge Clinic Lagos' },
                { value: 'Nordica Fertility Centre Lagos', label: 'Nordica Fertility Centre Lagos' },
                { value: 'St. Jude Fertility Clinic Lagos', label: 'St. Jude Fertility Clinic Lagos' },
                { value: 'Care Fertility & Lagos Partner', label: 'Care Fertility & Lagos Partner' },
              ]}
            />
            <Select
              label="Assigned Coordinator"
              value={newCoordinator}
              onChange={(e) => setNewCoordinator(e.target.value)}
              options={[
                { value: 'Chizaram Ata', label: 'Chizaram Ata (Clinical Director)' },
                { value: 'Amara Okafor', label: 'Amara Okafor (Senior Coordinator)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Matched Surrogate Code"
              value={newSurrogateCode}
              onChange={(e) => setNewSurrogateCode(e.target.value)}
              placeholder="e.g. ZZ-S-112 (Optional)"
            />
            <Input
              label="Matched Donor Code"
              value={newDonorCode}
              onChange={(e) => setNewDonorCode(e.target.value)}
              placeholder="e.g. ZZ-D-230 (Optional)"
            />
            <Input
              label="Estimated Budget ($USD)"
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              placeholder="48000"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E0DD]">
            <Button variant="secondary" type="button" onClick={() => setIsNewCaseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Case
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Case Confirmation */}
      <ConfirmModal
        isOpen={!!caseToDelete}
        onClose={() => setCaseToDelete(null)}
        onConfirm={handleDeleteCase}
        title="Delete Case Record"
        description={
          caseToDelete
            ? `Are you sure you want to permanently delete case record ${caseToDelete.case_number} (${caseToDelete.client_name})? This action will remove all milestones and clinical notes.`
            : ''
        }
        confirmLabel="Delete Case"
        variant="danger"
      />
    </div>
  );
};