
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
        bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20
        ${isActive ? "scale-105 shadow-2xl bg-white/90" : "scale-95 opacity-80"}
        transition-all duration-500 h-full flex flex-col relative overflow-hidden
        hover:shadow-2xl hover:scale-[1.02]
      `}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
      
      {/* Quote content section */}
      <div className="mb-8 relative flex-grow">
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
          <Quote className="text-primary/60" size={24} />
        </div>
        
        {isEditable && editing.id === testimonial.id && editing.field === 'content' ? (
          <div className="relative z-10 mt-4">
            <Textarea
              value={testimonial.content}
              onChange={(e) => onTextChange(testimonial.id, 'content', e.target.value)}
              className="min-h-[120px] text-gray-700 border-0 bg-gray-50/50 rounded-xl resize-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            <button 
              onClick={stopEditing}
              className="absolute top-3 right-3 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors"
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div className="relative z-10 group mt-4">
            <p className="text-gray-700 min-h-[120px] leading-relaxed text-base font-medium italic">
              "{testimonial.content}"
            </p>
            {isEditable && (
              <button 
                onClick={() => startEditing(testimonial.id, 'content')}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Rating section with enhanced styling */}
      <div className="flex items-center mb-6 justify-center">
        <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-full">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 transition-all duration-200 ${
                i < testimonial.rating 
                  ? "text-yellow-400 fill-yellow-400 scale-110" 
                  : "text-gray-300 hover:text-yellow-200"
              } ${isEditable ? "cursor-pointer hover:scale-125" : ""}`}
              onClick={() => isEditable && onRatingChange(testimonial.id, i + 1)}
            />
          ))}
        </div>
      </div>
      
      {/* Client info section */}
      <div className="flex items-center mt-auto pt-6 border-t border-gray-100">
        <div className="relative">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 p-1">
            <div className="h-full w-full rounded-full overflow-hidden bg-white">
              <AvatarUpload
                initialImage={testimonial.image}
                name={testimonial.name}
                onImageChange={handleImageChange}
                size="md"
                editable={isEditable}
              />
            </div>
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="ml-4 flex-1">
          {isEditable && editing.id === testimonial.id && editing.field === 'name' ? (
            <div className="relative">
              <Input
                value={testimonial.name}
                onChange={(e) => onTextChange(testimonial.id, 'name', e.target.value)}
                className="py-1 h-8 text-gray-900 font-semibold border-0 bg-gray-50 rounded-lg"
                autoFocus
              />
              <button 
                onClick={stopEditing}
                className="absolute top-1 right-2 bg-primary text-white p-1 rounded-full"
              >
                <Check size={12} />
              </button>
            </div>
          ) : (
            <div className="relative group">
              <p className="font-semibold text-gray-900 text-lg">{testimonial.name}</p>
              {isEditable && (
                <button 
                  onClick={() => startEditing(testimonial.id, 'name')}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 p-1 rounded-md"
                >
                  <Edit2 size={10} />
                </button>
              )}
            </div>
          )}
          
          {isEditable && editing.id === testimonial.id && editing.field === 'role' ? (
            <div className="relative mt-1">
              <Input
                value={testimonial.role}
                onChange={(e) => onTextChange(testimonial.id, 'role', e.target.value)}
                className="py-1 h-6 text-sm text-primary border-0 bg-gray-50 rounded-lg"
                autoFocus
              />
              <button 
                onClick={stopEditing}
                className="absolute top-1 right-2 bg-primary text-white p-1 rounded-full"
              >
                <Check size={12} />
              </button>
            </div>
          ) : (
            <div className="relative group mt-1">
              <p className="text-sm bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-medium">
                {testimonial.role}
              </p>
              {isEditable && (
                <button 
                  onClick={() => startEditing(testimonial.id, 'role')}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 p-1 rounded-md"
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
