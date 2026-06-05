const fs = require('fs');

let code = fs.readFileSync('src/app/about-page-content/page.tsx', 'utf-8');

// Replace imports
code = code.replace(
  'import {',
  'import { ImageUploadField } from "@/components/common/ImageUploadField";\nimport {'
);

// Remove the ImageUploadField definition inside the file (it is 62 lines long)
code = code.replace(/const ImageUploadField = \(\{[\s\S]*?\}\) => \{[\s\S]*?\};\n\n/m, '');

// Rename component and add props
code = code.replace(
  'export default function AboutPageContentAdmin() {',
  'export default function AboutpageComponentRouteEditor({ componentKey, title }: { componentKey: AboutPageContentKeys | "layout.header" | "layout.footer", title: string }) {'
);

// Simplify state and logic
code = code.replace(
  /const searchParams = useSearchParams\(\);[\s\S]*?const \[uploadingField, setUploadingField\] = useState<string \| null>\(null\);/m,
  `const [form, setForm] = useState<ContentForm>({
    key: componentKey as any,
    label: title,
    page: "about",
    description: "",
    isActive: true,
    data: defaultAboutpageData[componentKey as any] || {},
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);`
);

// Simplify refresh
code = code.replace(
  /const refresh = async \(\) => \{[\s\S]*?useEffect\(\(\) => \{ refresh\(\); \}, \[queryKey\]\);/m,
  `const refresh = async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      const existing = list.find(r => r.key === componentKey);
      if (existing) {
        setEditingId(existing._id);
        setForm({
          key: existing.key as any,
          label: existing.label,
          page: existing.page || "about",
          description: existing.description || "",
          isActive: existing.isActive,
          data: existing.data as any,
        });
      } else {
        setEditingId(null);
        const keyInfo = aboutpageKeys.find(k => k.key === componentKey);
        setForm(prev => ({
          ...prev,
          key: componentKey as any,
          label: keyInfo?.label || title,
          description: keyInfo?.description || "",
          data: defaultAboutpageData[componentKey as any] || {}
        }));
      }
    } catch (error) {
      toast.error("Failed to load components.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [componentKey]);`
);

// Carefully replace only the return structure at the end.
// We search for `return (\n    <div className="min-h-screen bg-[#fcfaf7]">`
// to ensure we only hit the main return, not the return inside renderHeroForm.
const returnStartIndex = code.indexOf('return (\n    <div className="min-h-screen bg-[#fcfaf7]">');
if (returnStartIndex !== -1) {
  const codeBeforeReturn = code.slice(0, returnStartIndex);
  const codeAfterReturn = code.slice(returnStartIndex);
  
  // Inside codeAfterReturn, we want to replace the sidebar and header.
  // The header looks like: `<header className="mb-10...`
  // The grid looks like: `<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">`
  // The aside looks like: `<aside className="lg:col-span-4 space-y-4"> ... </aside>`
  // Then the section looks like: `<section className="lg:col-span-8">`
  
  let newReturn = `return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <header className="mb-10 flex items-center justify-between border-b border-[#eee5d9] pb-6 px-8 pt-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8d6a3a]">Configuration</span>
          <h1 className="font-serif text-4xl text-[#1f261b] mt-1">{title}</h1>
        </div>
        <button type="button" onClick={refresh} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d9cdbb] text-[#263016] rounded-md font-bold text-sm shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50">
          Refresh
        </button>
      </header>

      <div className="max-w-5xl mx-auto pb-12">
        <section>`;
  
  const sectionIndex = codeAfterReturn.indexOf('<section className="lg:col-span-8">');
  if (sectionIndex !== -1) {
    let sectionCode = codeAfterReturn.slice(sectionIndex + '<section className="lg:col-span-8">'.length);
    
    // Remove the Meta Config section completely.
    // It looks like:
    // {/* Meta Config */}
    // <div className="grid grid-cols-2 gap-6 bg-[#fcfaf7] p-6 rounded-xl border border-[#eee5d9]">
    // ...
    // </div>
    // {/* Dynamic Data Editor */}
    
    const metaConfigIndex = sectionCode.indexOf('{/* Meta Config */}');
    const dynamicDataEditorIndex = sectionCode.indexOf('{/* Dynamic Data Editor */}');
    if (metaConfigIndex !== -1 && dynamicDataEditorIndex !== -1) {
      sectionCode = sectionCode.slice(0, metaConfigIndex) + sectionCode.slice(dynamicDataEditorIndex);
    }
    
    // The end of the file is:
    //             </div>
    //           </form>
    //         </section>
    //       </div>
    //     </div>
    //   );
    // }
    
    // We just append our new return logic:
    code = codeBeforeReturn + newReturn + sectionCode;
  }
}

fs.writeFileSync('src/components/about-page-content/AboutpageComponentRouteEditor.tsx', code);
console.log('Successfully created AboutpageComponentRouteEditor.tsx (fixed)');
