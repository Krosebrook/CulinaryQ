
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdate }) => {
  const [newDislike, setNewDislike] = useState('');
  const [newCuisine, setNewCuisine] = useState('');

  const addDislike = () => {
    if (newDislike && !profile.dislikes.includes(newDislike)) {
      onUpdate({ ...profile, dislikes: [...profile.dislikes, newDislike] });
      setNewDislike('');
    }
  };

  const removeDislike = (item: string) => {
    onUpdate({ ...profile, dislikes: profile.dislikes.filter(d => d !== item) });
  };

  const addCuisine = () => {
    if (newCuisine && !profile.preferredCuisines.includes(newCuisine)) {
      onUpdate({ ...profile, preferredCuisines: [...profile.preferredCuisines, newCuisine] });
      setNewCuisine('');
    }
  };

  const removeCuisine = (item: string) => {
    onUpdate({ ...profile, preferredCuisines: profile.preferredCuisines.filter(c => c !== item) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Culinary Profile</h2>

        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              🏆 Cooking Skill Level
            </h3>
            <div className="flex gap-4">
              {['Beginner', 'Intermediate', 'Expert'].map((level) => (
                <button
                  key={level}
                  onClick={() => onUpdate({ ...profile, skillLevel: level as any })}
                  className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                    profile.skillLevel === level 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              🍜 Preferred Cuisines
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCuisine}
                onChange={(e) => setNewCuisine(e.target.value)}
                placeholder="e.g. Italian, Thai"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                onClick={addCuisine}
                className="bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.preferredCuisines.map((c) => (
                <span key={c} className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                  {c} <button onClick={() => removeCuisine(c)} className="hover:text-emerald-900">✕</button>
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              🚫 Disliked Ingredients
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newDislike}
                onChange={(e) => setNewDislike(e.target.value)}
                placeholder="e.g. Cilantro, Olives"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                onClick={addDislike}
                className="bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.dislikes.map((d) => (
                <span key={d} className="bg-red-50 text-red-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                  {d} <button onClick={() => removeDislike(d)} className="hover:text-red-900">✕</button>
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
