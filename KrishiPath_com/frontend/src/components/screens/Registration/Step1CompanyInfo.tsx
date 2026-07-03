import { Button } from '../../ui/Button';
import { Building2, Upload } from 'lucide-react';

const categories = ['Pesticide', 'Fertilizer', 'Seeds', 'Bio-Fertilizer', 'Agri Equipment', 'Agri Finance', 'Other'];

interface Props {
  data: any;
  update: (patch: any) => void;
  onNext: () => void;
}

export function Step1CompanyInfo({ data, update, onNext }: Props) {
  const valid = data.companyName.trim() && data.businessCategory;

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center"><Building2 size={16} className="text-primary" /></div>
          <h2 className="text-lg font-bold text-text-primary">Company Information</h2>
        </div>
        <p className="text-sm text-text-secondary">Tell us about your agricultural business</p>
      </div>

      {/* Logo Upload */}
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-2">Company Logo</p>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary-light transition-colors cursor-pointer hover:bg-primary-50/30 group">
          <Upload size={20} className="text-text-muted mx-auto mb-2 group-hover:text-primary transition-colors" />
          <p className="text-xs text-text-secondary">Drag & drop or <span className="text-primary font-medium">browse</span></p>
          <p className="text-[10px] text-text-muted mt-0.5">PNG, JPG up to 2MB · Recommended 200×200px</p>
        </div>
      </div>

      {/* Company Name */}
      <div>
        <label className="text-xs font-semibold text-text-secondary block mb-1.5">Company Name <span className="text-error">*</span></label>
        <input
          value={data.companyName}
          onChange={e => update({ companyName: e.target.value })}
          placeholder="e.g. AgroGrow India Pvt. Ltd."
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Business Category */}
      <div>
        <label className="text-xs font-semibold text-text-secondary block mb-1.5">Business Category <span className="text-error">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => update({ businessCategory: cat })}
              className={[
                'py-2 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center',
                data.businessCategory === cat ? 'border-primary bg-primary-50 text-primary' : 'border-border text-text-secondary hover:border-border-dark',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Website & GST */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">Website URL</label>
          <input
            value={data.website}
            onChange={e => update({ website: e.target.value })}
            placeholder="www.yourbrand.com"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">
            GST Number <span className="text-[10px] font-normal text-text-muted">(optional)</span>
          </label>
          <input
            value={data.gst}
            onChange={e => update({ gst: e.target.value })}
            placeholder="27AABCU9603R1ZX"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors font-mono"
          />
        </div>
      </div>

      <Button fullWidth onClick={onNext} disabled={!valid} size="lg">
        Continue to KYC & Contact
      </Button>
    </div>
  );
}
