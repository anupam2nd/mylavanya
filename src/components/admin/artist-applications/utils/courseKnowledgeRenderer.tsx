
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type Json = Database['public']['Tables']['ArtistApplication']['Row']['course_knowledge'];

interface CourseKnowledgeRendererProps {
  courseKnowledge: Json;
}

export const CourseKnowledgeRenderer = ({ courseKnowledge }: CourseKnowledgeRendererProps) => {
  if (!courseKnowledge) return <p className="text-sm text-gray-500">No course knowledge available</p>;
  
  try {
    // Parse the course knowledge if it's a string, otherwise use as is
    let courseArray: string[] = [];
    
    if (typeof courseKnowledge === 'string') {
      courseArray = JSON.parse(courseKnowledge);
    } else if (Array.isArray(courseKnowledge)) {
      // Handle Json array - convert each item to string
      courseArray = courseKnowledge.map(item => 
        typeof item === 'string' ? item : String(item)
      );
    }
    
    if (courseArray.length === 0) {
      return <p className="text-sm text-gray-500">No course knowledge available</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {courseArray.map((course, index) => (
          <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            {course}
          </Badge>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error parsing course knowledge:', error);
    return <p className="text-sm text-red-500">Error displaying course knowledge</p>;
  }
};
