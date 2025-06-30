
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ArtistApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const courseOptions = [
  "Hair Styling",
  "Makeup Artistry", 
  "Nail Art",
  "Mehendi/Henna",
  "Facial Treatments",
  "Eyebrow Threading",
  "Hair Coloring",
  "Bridal Makeup",
  "Special Effects Makeup",
  "Other"
];

export default function ArtistApplicationDialog({ isOpen, onClose }: ArtistApplicationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    branch_name: "",
    application_date: new Date().toISOString().split('T')[0],
    full_name: "",
    phone_no: "",
    date_of_birth: "",
    gender: "",
    full_address: "",
    landmark: "",
    pin_code: "",
    marital_status: "",
    guardian_name: "",
    guardian_contact_no: "",
    relationship_with_guardian: "",
    educational_qualification: "",
    job_type: "",
    job_experience_years: 0,
    has_job_experience: false,
    other_job_description: "",
    course_knowledge: [] as string[],
    trainer_name: "",
    training_required: false,
    training_requirements: "",
    trainer_feedback: ""
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCourseKnowledgeChange = (course: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      course_knowledge: checked 
        ? [...prev.course_knowledge, course]
        : prev.course_knowledge.filter(c => c !== course)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone_no) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('ArtistApplication')
        .insert([{
          ...formData,
          application_date: formData.application_date || new Date().toISOString().split('T')[0],
          date_of_birth: formData.date_of_birth || null,
          job_experience_years: formData.has_job_experience ? formData.job_experience_years : null
        }]);

      if (error) {
        console.error('Error submitting application:', error);
        toast.error("Failed to submit application. Please try again.");
        return;
      }

      toast.success("Application submitted successfully! We'll contact you soon.");
      onClose();
      
      // Reset form
      setFormData({
        branch_name: "",
        application_date: new Date().toISOString().split('T')[0],
        full_name: "",
        phone_no: "",
        date_of_birth: "",
        gender: "",
        full_address: "",
        landmark: "",
        pin_code: "",
        marital_status: "",
        guardian_name: "",
        guardian_contact_no: "",
        relationship_with_guardian: "",
        educational_qualification: "",
        job_type: "",
        job_experience_years: 0,
        has_job_experience: false,
        other_job_description: "",
        course_knowledge: [],
        trainer_name: "",
        training_required: false,
        training_requirements: "",
        trainer_feedback: ""
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary">
            Apply to Join Our Makeup Team
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="branch_name">Branch Name</Label>
              <Input
                id="branch_name"
                value={formData.branch_name}
                onChange={(e) => handleInputChange("branch_name", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="application_date">Application Date</Label>
              <Input
                id="application_date"
                type="date"
                value={formData.application_date}
                onChange={(e) => handleInputChange("application_date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="phone_no">Phone Number *</Label>
              <Input
                id="phone_no"
                required
                value={formData.phone_no}
                onChange={(e) => handleInputChange("phone_no", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="full_address">Full Address</Label>
            <Textarea
              id="full_address"
              value={formData.full_address}
              onChange={(e) => handleInputChange("full_address", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                value={formData.landmark}
                onChange={(e) => handleInputChange("landmark", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="pin_code">Pin Code</Label>
              <Input
                id="pin_code"
                value={formData.pin_code}
                onChange={(e) => handleInputChange("pin_code", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="marital_status">Marital Status</Label>
            <Select onValueChange={(value) => handleInputChange("marital_status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Marital Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="guardian_name">Guardian Name</Label>
                <Input
                  id="guardian_name"
                  value={formData.guardian_name}
                  onChange={(e) => handleInputChange("guardian_name", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="guardian_contact_no">Guardian Contact</Label>
                <Input
                  id="guardian_contact_no"
                  value={formData.guardian_contact_no}
                  onChange={(e) => handleInputChange("guardian_contact_no", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="relationship_with_guardian">Relationship</Label>
                <Input
                  id="relationship_with_guardian"
                  value={formData.relationship_with_guardian}
                  onChange={(e) => handleInputChange("relationship_with_guardian", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="educational_qualification">Educational Qualification</Label>
            <Input
              id="educational_qualification"
              value={formData.educational_qualification}
              onChange={(e) => handleInputChange("educational_qualification", e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Experience</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_job_experience"
                checked={formData.has_job_experience}
                onCheckedChange={(checked) => handleInputChange("has_job_experience", checked)}
              />
              <Label htmlFor="has_job_experience">I have job experience</Label>
            </div>
            
            {formData.has_job_experience && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_type">Job Type</Label>
                  <Input
                    id="job_type"
                    value={formData.job_type}
                    onChange={(e) => handleInputChange("job_type", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="job_experience_years">Years of Experience</Label>
                  <Input
                    id="job_experience_years"
                    type="number"
                    min="0"
                    value={formData.job_experience_years}
                    onChange={(e) => handleInputChange("job_experience_years", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="other_job_description">Other Job Description</Label>
              <Textarea
                id="other_job_description"
                value={formData.other_job_description}
                onChange={(e) => handleInputChange("other_job_description", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course Knowledge</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {courseOptions.map((course) => (
                <div key={course} className="flex items-center space-x-2">
                  <Checkbox
                    id={`course_${course}`}
                    checked={formData.course_knowledge.includes(course)}
                    onCheckedChange={(checked) => handleCourseKnowledgeChange(course, checked as boolean)}
                  />
                  <Label htmlFor={`course_${course}`} className="text-sm">{course}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Training Information</h3>
            <div>
              <Label htmlFor="trainer_name">Trainer Name</Label>
              <Input
                id="trainer_name"
                value={formData.trainer_name}
                onChange={(e) => handleInputChange("trainer_name", e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="training_required"
                checked={formData.training_required}
                onCheckedChange={(checked) => handleInputChange("training_required", checked)}
              />
              <Label htmlFor="training_required">Training Required</Label>
            </div>
            
            {formData.training_required && (
              <div>
                <Label htmlFor="training_requirements">Training Requirements</Label>
                <Textarea
                  id="training_requirements"
                  value={formData.training_requirements}
                  onChange={(e) => handleInputChange("training_requirements", e.target.value)}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="trainer_feedback">Trainer Feedback</Label>
              <Textarea
                id="trainer_feedback"
                value={formData.trainer_feedback}
                onChange={(e) => handleInputChange("trainer_feedback", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
