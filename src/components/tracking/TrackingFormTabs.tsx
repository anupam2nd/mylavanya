
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneTrackingForm, PhoneFormValues } from "./PhoneTrackingForm";
import { ReferenceTrackingForm, ReferenceFormValues } from "./ReferenceTrackingForm";

interface TrackingFormTabsProps {
  onPhoneSubmit: (values: PhoneFormValues) => void;
  onReferenceSubmit: (values: ReferenceFormValues) => void;
}

export function TrackingFormTabs({ onPhoneSubmit, onReferenceSubmit }: TrackingFormTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("phone");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue="phone"
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="phone">Track by Phone</TabsTrigger>
        <TabsTrigger value="reference">Track by Reference</TabsTrigger>
      </TabsList>
      <TabsContent value="phone">
        <PhoneTrackingForm onSubmit={onPhoneSubmit} />
      </TabsContent>
      <TabsContent value="reference">
        <ReferenceTrackingForm onSubmit={onReferenceSubmit} />
      </TabsContent>
    </Tabs>
  );
}
