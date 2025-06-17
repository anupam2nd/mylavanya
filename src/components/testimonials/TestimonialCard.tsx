
import { useState } from "react";
import { Star, Quote, Edit2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AvatarUpload from "@/components/testimonials/AvatarUpload";
import { Testimonial } from "./TestimonialData";

interface EditingState {
  id: number | null;
  field: 'name' | 'role' | 'content' | null;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  isActive: boolean;
  isEditable: boolean;
  onTextChange: (id: number, field: 'name' | 'role' | 'content', value: string) => void;
  onRatingChange: (id: number, newRating: number) => void;
  onImageChange: (id: number, newImageUrl: string) => void;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  isActive,
  isEditable,
  onTextChange,
  onRatingChange,
  onImageChange
}) => {
  const [editing, setEditing] = useState<EditingState>({ id: null, field: null });

  const startEditing = (id: number, field: 'name' | 'role' | 'content') => {
    setEditing({ id, field });
  };

  const stopEditing = () => {
    setEditing({ id: null, field: null });
  };

  const handleImageChange = (imageUrl: string) => {
    onImageChange(testimonial.id, imageUrl);
  };

  return (
    <div 
      className={`
        glass-card p-8 rounded-3xl border border-white/30 backdrop-blur-xl
        ${isActive ? "scale-105 shadow-2xl bg-white/95" : "scale-95 opacity-90 bg-white/80"}
        transition-all duration-700 ease-out h-full flex flex-col relative overflow-hidden
        hover:shadow-2xl hover:scale-[1.02] hover:bg-white/90 group
      `}
    >
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-primary/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700"></div>
      
      {/* Quote content section with improved spacing */}
      <div className="mb-8 relative flex-grow z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <Quote className="text-primary/70" size={20} />
          </div>
          
          {/* Rating section moved to top */}
          <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 transition-all duration-200 ${
                  i < testimonial.rating 
                    ? "text-yellow-400 fill-yellow-400 scale-110" 
                    : "text-gray-300 hover:text-yellow-200"
                } ${isEditable ? "cursor-pointer hover:scale-125" : ""}`}
                onClick={() => isEditable && onRatingChange(testimonial.id, i + 1)}
              />
            ))}
          </div>
        </div>
        
        {isEditable && editing.id === testimonial.id && editing.field === 'content' ? (
          <div className="relative">
            <Textarea
              value={testimonial.content}
              onChange={(e) => onTextChange(testimonial.id, 'content', e.target.value)}
              className="min-h-[140px] text-gray-700 border-0 bg-white/50 backdrop-blur-sm rounded-2xl resize-none focus:ring-2 focus:ring-primary/30 shadow-inner"
              autoFocus
            />
            <button 
              onClick={stopEditing}
              className="absolute top-3 right-3 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div className="relative group/content">
            <blockquote className="text-gray-700 min-h-[140px] leading-relaxed text-base font-medium italic relative">
              <span className="text-6xl text-primary/20 absolute -top-4 -left-2 font-serif">"</span>
              <p className="relative z-10 pl-6">{testimonial.content}</p>
              <span className="text-6xl text-primary/20 absolute -bottom-8 -right-2 font-serif rotate-180">"</span>
            </blockquote>
            {isEditable && (
              <button 
                onClick={() => startEditing(testimonial.id, 'content')}
                className="absolute top-2 right-2 opacity-0 group-hover/content:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm hover:bg-white p-2 rounded-lg shadow-sm border border-white/30"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Client info section with enhanced design */}
      <div className="flex items-center pt-8 border-t border-white/40 relative z-10">
        <div className="relative">
          {/* Enhanced avatar container */}
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-primary/30 to-purple-500/30 p-1 backdrop-blur-sm border border-white/40 shadow-lg">
            <div className="h-full w-full rounded-full overflow-hidden bg-white shadow-inner">
              <AvatarUpload
                initialImage={testimonial.image}
                name={testimonial.name}
                onImageChange={handleImageChange}
                size="md"
                editable={isEditable}
              />
            </div>
          </div>
          {/* Enhanced online indicator */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 border-3 border-white rounded-full shadow-lg animate-pulse"></div>
        </div>
        
        <div className="ml-4 flex-1">
          {isEditable && editing.id === testimonial.id && editing.field === 'name' ? (
            <div className="relative">
              <Input
                value={testimonial.name}
                onChange={(e) => onTextChange(testimonial.id, 'name', e.target.value)}
                className="py-1 h-8 text-gray-900 font-semibold border-0 bg-white/60 backdrop-blur-sm rounded-lg shadow-inner"
                autoFocus
              />
              <button 
                onClick={stopEditing}
                className="absolute top-1 right-2 bg-primary text-white p-1 rounded-full shadow-lg"
              >
                <Check size={12} />
              </button>
            </div>
          ) : (
            <div className="relative group/name">
              <h4 className="font-bold text-gray-900 text-lg mb-1">{testimonial.name}</h4>
              {isEditable && (
                <button 
                  onClick={() => startEditing(testimonial.id, 'name')}
                  className="absolute top-0 right-0 opacity-0 group-hover/name:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm hover:bg-white p-1 rounded-md shadow-sm border border-white/30"
                >
                  <Edit2 size={10} />
                </button>
              )}
            </div>
          )}
          
          {isEditable && editing.id === testimonial.id && editing.field === 'role' ? (
            <div className="relative">
              <Input
                value={testimonial.role}
                onChange={(e) => onTextChange(testimonial.id, 'role', e.target.value)}
                className="py-1 h-6 text-sm text-primary border-0 bg-white/60 backdrop-blur-sm rounded-lg shadow-inner"
                autoFocus
              />
              <button 
                onClick={stopEditing}
                className="absolute top-1 right-2 bg-primary text-white p-1 rounded-full shadow-lg"
              >
                <Check size={12} />
              </button>
            </div>
          ) : (
            <div className="relative group/role">
              <p className="text-sm bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-semibold px-3 py-1 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 inline-block">
                {testimonial.role}
              </p>
              {isEditable && (
                <button 
                  onClick={() => startEditing(testimonial.id, 'role')}
                  className="absolute top-0 right-0 opacity-0 group-hover/role:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm hover:bg-white p-1 rounded-md shadow-sm border border-white/30"
                >
                  <Edit2 size={10} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
