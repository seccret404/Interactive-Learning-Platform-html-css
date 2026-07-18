import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal/Modal';
import { Button } from '@/components/Button/Button';
import { useProgress } from '@/context/ProgressContext';

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
}

/** Edit the learner's profile (name + class). Persisted in localStorage. */
export function ProfileModal({ open, onClose }: ProfileModalProps) {
    const { progress, setProfile } = useProgress();
    const [name, setName] = useState('');
    const [kelas, setKelas] = useState('');

    // Reset fields to the current profile each time the modal opens.
    useEffect(() => {
        if (open) {
            setName(progress.profile?.name ?? '');
            setKelas(progress.profile?.kelas ?? '');
        }
    }, [open, progress.profile]);

    const save = () => {
        setProfile({ name: name.trim(), kelas: kelas.trim() });
        onClose();
    };

    const initial = (name.trim()[0] ?? 'B').toUpperCase();

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Profil Kamu"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Batal
                    </Button>
                    <Button variant="primary" onClick={save} disabled={name.trim() === ''}>
                        Simpan
                    </Button>
                </>
            }
        >
            <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-html-500 to-brand-500 text-xl font-bold text-white">
                    {initial}
                </span>
                <p className="text-sm text-slate-500">
                    Nama dan kelas ini dipakai untuk menyapamu di seluruh aplikasi.
                    Tersimpan di perangkat ini.
                </p>
            </div>

            <div className="mt-5 space-y-4">
                <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Nama
                    </span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama lengkap kamu"
                        maxLength={40}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Kelas
                    </span>
                    <input
                        type="text"
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        placeholder="Misalnya: XI RPL 1"
                        maxLength={30}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                    />
                </label>
            </div>
        </Modal>
    );
}
