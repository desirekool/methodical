import React from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Project, Member, FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  projects: Project[];
  members: Member[];
  categories: string[];
  labels: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  setFilters, 
  projects, 
  members, 
  categories, 
  labels 
}) => {
  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      projectIds: [],
      memberIds: [],
      categories: [],
      labels: [],
    });
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.projectIds.length > 0 || 
    filters.memberIds.length > 0 || 
    filters.categories.length > 0 || 
    filters.labels.length > 0;

  return (
    <div className="px-8 py-3 bg-surface border-b border-outline-variant/10 flex flex-wrap items-center gap-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
        <input 
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Projects */}
      <FilterDropdown 
        label="Project" 
        options={projects.map(p => ({ id: p.id, label: p.name }))}
        selectedIds={filters.projectIds}
        onToggle={(id) => toggleFilter('projectIds', id)}
      />

      {/* Members */}
      <FilterDropdown 
        label="Assignee" 
        options={members.map(m => ({ id: m.id, label: m.name }))}
        selectedIds={filters.memberIds}
        onToggle={(id) => toggleFilter('memberIds', id)}
      />

      {/* Categories */}
      <FilterDropdown 
        label="Category" 
        options={categories.map(c => ({ id: c, label: c }))}
        selectedIds={filters.categories}
        onToggle={(id) => toggleFilter('categories', id)}
      />

      {/* Labels */}
      <FilterDropdown 
        label="Labels" 
        options={labels.map(l => ({ id: l, label: l }))}
        selectedIds={filters.labels}
        onToggle={(id) => toggleFilter('labels', id)}
      />

      {hasActiveFilters && (
        <button 
          onClick={clearFilters}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Clear all
        </button>
      )}
    </div>
  );
};

interface FilterDropdownProps {
  label: string;
  options: { id: string; label: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, selectedIds, onToggle }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCount = selectedIds.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
          selectedCount > 0 
            ? 'bg-primary/10 border-primary text-primary' 
            : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'
        }`}
      >
        {label}
        {selectedCount > 0 && (
          <span className="bg-primary text-on-primary text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
            {selectedCount}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-surface-bright border border-outline-variant/20 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {options.map(option => (
              <label 
                key={option.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => onToggle(option.id)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
