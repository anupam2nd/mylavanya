
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
        bg-background p-8 rounded-2xl shadow-card border border-accent/20
        ${isActive ? "scale-105" : "scale-95 opacity-80"}
        transition-all duration-300 h-full flex flex-col
      `}
    >
      <div className="mb-6 relative flex-grow">
        <Quote className="text-accent-foreground/10 absolute -top-2 -left-2" size={40} />
        
        {isEditable && editing.id === testimonial.id && editing.field === 'content' ? (
          <div className="relative z-10">
            <Textarea
              value={testimonial.content}
              onChange={(e) => onTextChange(testimonial.id, 'content', e.target.value)}
              className="min-h-[100px] text-foreground"
              autoFocus
            />
            <button 
              onClick={stopEditing}
              className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="relative z-10 group">
            <p className="text-muted-foreground min-h-[120px]">{testimonial.content}</p>
            {isEditable && (
              <button 
                onClick={() => startEditing(testimonial.id, 'content')}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-muted p-1 rounded-md"
              >
                <Edit2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            } ${isEditable ? "cursor-pointer" : ""}`}
            onClick={() => isEditable && onRatingChange(testimonial.id, i + 1)}
          />
        ))}
      </div>
      
      <div className="flex items-center mt-auto">
        <div className="h-12 w-12 rounded-full overflow-hidden mr-4 bg-gray-100">
          <AvatarUpload
            initialImage={testimonial.image}
            name={testimonial.name}
            onImageChange={handleImageChange}
            size="md"
            editable={isEditable}
          />
        </div>
        <div>
          {isEditable && editing.id === testimonial.id && editing.field === 'name' ? (
            <div className="relative">
              <Input
                value={testimonial.name}
                onChange={(e) => onTextChange(testimonial.id, 'name', e.target.value)}
                className="py-0 h-7 text-foreground font-medium"
                autoFocus
              />
              <button 
                onClick={stopEditing}
                className="absolute top-1 right-2 bg-primary text-white p-0.5 rounded-full"
              >
                <Check size={12} />
              </button>
            </div>
          ) : (
            <div className="relative group">
              <p className="font-medium text-foreground">{testimonial.name}</p>
              {isEditable && (
                <button 
                  onClick={() => startEditing(testimonial.id, 'name')}
                  className="absolute top-0 right-[-20px] opacity-0 group-hover:opacity-100 transition-opacity bg-muted p-0.5 rounded-md"
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
                className="py-0 h-6 text-sm text-primary"
                autoFocus
              />
              <button 
                onClick={stopEditing}
                className="absolute top-1 right-2 bg-primary text-white p-0.5 rounded-full"
              >
                <Check size={12} />
              </button>
            </div>
          ) : (
            <div className="relative group">
              <p className="text-sm text-primary">{testimonial.role}</p>
              {isEditable && (
                <button 
                  onClick={() => startEditing(testimonial.id, 'role')}
                  className="absolute top-0 right-[-20px] opacity-0 group-hover:opacity-100 transition-opacity bg-muted p-0.5 rounded-md"
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
