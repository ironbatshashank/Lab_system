import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface MaterialRow {
  id: string;
  materialName: string;
  quantity: string;
  unitPrice: string;
}

interface LaborRow {
  id: string;
  technicianName: string;
  workDate: string;
  startTime: string;
  finishTime: string;
  hours: string;
}

export function CreateProject() {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    requestorFacultySchool: '',
    requestorEmail: profile?.full_name ? `${profile.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com` : '',
    requestorPhone: '',
    typeOfWork: '',
    studentProjectTitle: '',
    studentName: '',
    supervisorName: '',
    healthSafetyConfirmed: false,
    priority: 'C',
    dateRequired: '',
    title: '',
    description: '',
    jobDescription: '',
    objectives: '',
    safetyConsiderations: '',
    expectedOutcomes: '',
    timelineDuration: '',
    remarks: '',
    variationOrderRequested: false,
    drawingsAttached: false,
    workLocation: '',
    technicianAllocated: '',
    qtyMaterialSuppliedBySoe: '',
    poNumbers: '',
    workshopRemarks: '',
  });

  const [materials, setMaterials] = useState<MaterialRow[]>([
    { id: '1', materialName: '', quantity: '', unitPrice: '' }
  ]);

  const [labor, setLabor] = useState<LaborRow[]>([
    { id: '1', technicianName: '', workDate: '', startTime: '', finishTime: '', hours: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const addMaterialRow = () => {
    setMaterials([...materials, {
      id: Date.now().toString(),
      materialName: '',
      quantity: '',
      unitPrice: ''
    }]);
  };

  const removeMaterialRow = (id: string) => {
    if (materials.length > 1) {
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const updateMaterial = (id: string, field: keyof MaterialRow, value: string) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addLaborRow = () => {
    setLabor([...labor, {
      id: Date.now().toString(),
      technicianName: '',
      workDate: '',
      startTime: '',
      finishTime: '',
      hours: ''
    }]);
  };

  const removeLaborRow = (id: string) => {
    if (labor.length > 1) {
      setLabor(labor.filter(l => l.id !== id));
    }
  };

  const updateLabor = (id: string, field: keyof LaborRow, value: string) => {
    setLabor(labor.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const calculateTotalMaterialCost = () => {
    return materials.reduce((total, material) => {
      const qty = parseFloat(material.quantity) || 0;
      const price = parseFloat(material.unitPrice) || 0;
      return total + (qty * price);
    }, 0).toFixed(2);
  };

  const calculateTotalHours = () => {
    return labor.reduce((total, l) => {
      const hours = parseFloat(l.hours) || 0;
      return total + hours;
    }, 0).toFixed(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.healthSafetyConfirmed) {
      showToast('You must confirm that the design is free from Health & Safety issues', 'error');
      return;
    }

    if (!formData.typeOfWork) {
      showToast('Please select a type of work', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          description: formData.description,
          objectives: formData.objectives,
          safety_considerations: formData.safetyConsiderations,
          expected_outcomes: formData.expectedOutcomes,
          timeline_duration: formData.timelineDuration,
          engineer_id: profile?.id,
          status: 'draft',
          requestor_faculty_school: formData.requestorFacultySchool,
          requestor_email: formData.requestorEmail,
          requestor_phone: formData.requestorPhone,
          type_of_work: formData.typeOfWork,
          student_project_title: formData.studentProjectTitle,
          student_name: formData.studentName,
          supervisor_name: formData.supervisorName,
          health_safety_confirmed: formData.healthSafetyConfirmed,
          priority: formData.priority,
          date_required: formData.dateRequired || null,
          job_description: formData.jobDescription,
          remarks: formData.remarks,
          variation_order_requested: formData.variationOrderRequested,
          drawings_attached: formData.drawingsAttached,
          work_location: formData.workLocation,
          technician_allocated: formData.technicianAllocated,
          qty_material_supplied_by_soe: formData.qtyMaterialSuppliedBySoe,
          po_numbers: formData.poNumbers,
          workshop_remarks: formData.workshopRemarks,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Insert materials
      const materialsToInsert = materials
        .filter(m => m.materialName && m.quantity && m.unitPrice)
        .map(m => ({
          project_id: projectData.id,
          material_name: m.materialName,
          quantity: parseFloat(m.quantity),
          unit_price: parseFloat(m.unitPrice),
        }));

      if (materialsToInsert.length > 0) {
        const { error: materialsError } = await supabase
          .from('project_materials')
          .insert(materialsToInsert);

        if (materialsError) throw materialsError;
      }

      // Insert labor entries
      const laborToInsert = labor
        .filter(l => l.technicianName && l.hours)
        .map(l => ({
          project_id: projectData.id,
          technician_name: l.technicianName,
          work_date: l.workDate || null,
          start_time: l.startTime || null,
          finish_time: l.finishTime || null,
          hours: parseFloat(l.hours),
        }));

      if (laborToInsert.length > 0) {
        const { error: laborError } = await supabase
          .from('project_labor')
          .insert(laborToInsert);

        if (laborError) throw laborError;
      }

      showToast('Engineering Service Request created successfully', 'success');
      navigate(`/projects/${projectData.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      showToast('Failed to create service request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isStudentProject = ['Undergraduate Project', 'Postgraduate Project'].includes(formData.typeOfWork);

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">SoE Engineering Service Request Form</h2>
          <p className="text-gray-600 mt-1">Complete all required fields to submit your engineering service request</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PAGE 1 - Requestor Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requestor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Name of Requestor"
                    type="text"
                    value={profile?.full_name || ''}
                    disabled
                    helpText="Auto-filled from your profile"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Engineering / Faculty / School / External Organisation"
                    type="text"
                    value={formData.requestorFacultySchool}
                    onChange={(e) => setFormData({ ...formData, requestorFacultySchool: e.target.value })}
                    placeholder="e.g., School of Engineering, Mechanical Department"
                    required
                  />
                </div>
                <Input
                  label="Requestor Contact Email Address"
                  type="email"
                  value={formData.requestorEmail}
                  onChange={(e) => setFormData({ ...formData, requestorEmail: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                />
                <Input
                  label="Requestor Contact Tel No."
                  type="tel"
                  value={formData.requestorPhone}
                  onChange={(e) => setFormData({ ...formData, requestorPhone: e.target.value })}
                  placeholder="+44 1234 567890"
                  required
                />
              </div>
            </div>

            {/* Type of Work Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Type of Work</h3>
              <Select
                label="Select Work Type"
                value={formData.typeOfWork}
                onChange={(e) => setFormData({ ...formData, typeOfWork: e.target.value })}
                required
              >
                <option value="">-- Select Type of Work --</option>
                <option value="Undergraduate Project">Undergraduate Project</option>
                <option value="Postgraduate Project">Postgraduate Project</option>
                <option value="External Work">External Work</option>
                <option value="Teaching Project">Teaching Project</option>
              </Select>
            </div>

            {/* Student Project Details - Conditional */}
            {isStudentProject && (
              <div className="border-b border-gray-200 pb-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Project Details</h3>
                <div className="space-y-4">
                  <Input
                    label="Project Title"
                    type="text"
                    value={formData.studentProjectTitle}
                    onChange={(e) => setFormData({ ...formData, studentProjectTitle: e.target.value })}
                    placeholder="Enter the student project title"
                    required={isStudentProject}
                  />
                  <Input
                    label="Name of Student"
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="Enter student's full name"
                    required={isStudentProject}
                  />
                  <Input
                    label="Name of Supervisor"
                    type="text"
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                    placeholder="Enter supervisor's full name"
                    required={isStudentProject}
                  />
                </div>
              </div>
            )}

            {/* Project Title and Description */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
              <div className="space-y-4">
                <Input
                  label="Request Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief title for this service request"
                  required
                />
                <Textarea
                  label="Project Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a general overview of the project"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Priority and Dates */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority & Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                  helpText="A: Emergency, B: Urgent, C: Normal"
                >
                  <option value="A">A - Emergency (Immediate danger to personnel)</option>
                  <option value="B">B - Urgent Work</option>
                  <option value="C">C - Normal Priority</option>
                </Select>
                <Input
                  label="Date Required"
                  type="date"
                  value={formData.dateRequired}
                  onChange={(e) => setFormData({ ...formData, dateRequired: e.target.value })}
                  required
                />
                <div className="md:col-span-2">
                  <Input
                    label="Estimated Timeline Duration"
                    type="text"
                    value={formData.timelineDuration}
                    onChange={(e) => setFormData({ ...formData, timelineDuration: e.target.value })}
                    placeholder="e.g., 2 weeks, 1 month"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
              <Textarea
                label="Detailed Job Description"
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                placeholder="Provide detailed description of the work to be carried out. Attach drawings as appropriate."
                rows={6}
                required
                helpText="Include all necessary technical details, specifications, and requirements"
              />
            </div>

            {/* Technical Details */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
              <div className="space-y-4">
                <Textarea
                  label="Objectives"
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  placeholder="What are the main objectives and goals?"
                  rows={3}
                  required
                />
                <Textarea
                  label="Safety Considerations"
                  value={formData.safetyConsiderations}
                  onChange={(e) => setFormData({ ...formData, safetyConsiderations: e.target.value })}
                  placeholder="List all Health & Safety requirements and considerations"
                  rows={4}
                  required
                />
                <Textarea
                  label="Expected Outcomes"
                  value={formData.expectedOutcomes}
                  onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
                  placeholder="What are the expected results and deliverables?"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <Textarea
                label="Remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Any additional notes, special requirements, or comments"
                rows={4}
              />
            </div>

            {/* Checkboxes Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h3>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.drawingsAttached}
                    onChange={(e) => setFormData({ ...formData, drawingsAttached: e.target.checked })}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Drawings Attached</span>
                    <p className="text-xs text-gray-600">Check if you have attached CAD drawings or technical diagrams</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.variationOrderRequested}
                    onChange={(e) => setFormData({ ...formData, variationOrderRequested: e.target.checked })}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Variation Order Requested</span>
                    <p className="text-xs text-gray-600">Request modifications to existing approved work</p>
                  </div>
                </label>
              </div>
            </div>

            {/* PAGE 2 - Workshop Lead Section */}
            <div className="border-b border-gray-200 pb-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Workshop Details (Page 2)</h3>
              <p className="text-sm text-gray-600 mb-6">To be filled in by SoE Workshop Lead</p>

              <div className="space-y-4">
                <Select
                  label="Work is to be carried out in"
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                >
                  <option value="">-- Select Location --</option>
                  <option value="Main Labs">Main Labs</option>
                  <option value="Workshop">Workshop</option>
                </Select>

                <Input
                  label="Technician Allocated"
                  type="text"
                  value={formData.technicianAllocated}
                  onChange={(e) => setFormData({ ...formData, technicianAllocated: e.target.value })}
                  placeholder="Name of technician assigned"
                />

                <Textarea
                  label="Qty of Material Supplied by SoE"
                  value={formData.qtyMaterialSuppliedBySoe}
                  onChange={(e) => setFormData({ ...formData, qtyMaterialSuppliedBySoe: e.target.value })}
                  placeholder="List materials and quantities supplied by SoE"
                  rows={3}
                />

                <Textarea
                  label="P.O. No(s). for any material purchased by SoE"
                  value={formData.poNumbers}
                  onChange={(e) => setFormData({ ...formData, poNumbers: e.target.value })}
                  placeholder="Enter purchase order numbers"
                  rows={2}
                />

                <Textarea
                  label="Workshop Remarks"
                  value={formData.workshopRemarks}
                  onChange={(e) => setFormData({ ...formData, workshopRemarks: e.target.value })}
                  placeholder="Additional workshop-specific notes"
                  rows={3}
                />
              </div>
            </div>

            {/* PAGE 3 - Workshop Use Only - Labor Tracking */}
            <div className="border-b border-gray-200 pb-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Workshop Use Only - Labor Hours (Page 3)</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">Track technician labor hours</p>
                  <Button type="button" variant="secondary" size="sm" onClick={addLaborRow}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Row
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Name</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Date</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Start</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Finish</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Hours</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labor.map((row) => (
                        <tr key={row.id}>
                          <td className="border border-gray-300 p-1">
                            <input
                              type="text"
                              value={row.technicianName}
                              onChange={(e) => updateLabor(row.id, 'technicianName', e.target.value)}
                              className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Technician name"
                            />
                          </td>
                          <td className="border border-gray-300 p-1">
                            <input
                              type="date"
                              value={row.workDate}
                              onChange={(e) => updateLabor(row.id, 'workDate', e.target.value)}
                              className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-1">
                            <input
                              type="time"
                              value={row.startTime}
                              onChange={(e) => updateLabor(row.id, 'startTime', e.target.value)}
                              className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-1">
                            <input
                              type="time"
                              value={row.finishTime}
                              onChange={(e) => updateLabor(row.id, 'finishTime', e.target.value)}
                              className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-1">
                            <input
                              type="number"
                              step="0.5"
                              value={row.hours}
                              onChange={(e) => updateLabor(row.id, 'hours', e.target.value)}
                              className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0.0"
                            />
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            <button
                              type="button"
                              onClick={() => removeLaborRow(row.id)}
                              disabled={labor.length === 1}
                              className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right font-semibold">
                          Total Hours:
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-bold">
                          {calculateTotalHours()}
                        </td>
                        <td className="border border-gray-300"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* PAGE 3 - Materials List */}
            <div className="border-b border-gray-200 pb-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Materials Required (Page 3)</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">List all materials needed for this project</p>
                  <Button type="button" variant="secondary" size="sm" onClick={addMaterialRow}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Material
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Material</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">QTY</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Unit Price</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Cost</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((row) => {
                        const cost = (parseFloat(row.quantity) || 0) * (parseFloat(row.unitPrice) || 0);
                        return (
                          <tr key={row.id}>
                            <td className="border border-gray-300 p-1">
                              <input
                                type="text"
                                value={row.materialName}
                                onChange={(e) => updateMaterial(row.id, 'materialName', e.target.value)}
                                className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Material name"
                              />
                            </td>
                            <td className="border border-gray-300 p-1">
                              <input
                                type="number"
                                step="0.01"
                                value={row.quantity}
                                onChange={(e) => updateMaterial(row.id, 'quantity', e.target.value)}
                                className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </td>
                            <td className="border border-gray-300 p-1">
                              <input
                                type="number"
                                step="0.01"
                                value={row.unitPrice}
                                onChange={(e) => updateMaterial(row.id, 'unitPrice', e.target.value)}
                                className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm font-medium">
                              £{cost.toFixed(2)}
                            </td>
                            <td className="border border-gray-300 p-1 text-center">
                              <button
                                type="button"
                                onClick={() => removeMaterialRow(row.id)}
                                disabled={materials.length === 1}
                                className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="border border-gray-300 px-3 py-2 text-right font-semibold">
                          Total Material Cost:
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-bold">
                          £{calculateTotalMaterialCost()}
                        </td>
                        <td className="border border-gray-300"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Confirmation Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">Required Confirmation</h4>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.healthSafetyConfirmed}
                      onChange={(e) => setFormData({ ...formData, healthSafetyConfirmed: e.target.checked })}
                      className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      required
                    />
                    <span className="text-sm text-gray-900">
                      I confirm that all the information submitted in this application, inclusive of the attached drawings, is correct;
                      and also that the part(s) design in the attached drawings is/are <strong>free from any Health & Safety issues</strong>.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-700">
                <strong>Disclaimer:</strong> The design(s) and/or intended use(s)/final application(s) of the assembled/manufactured
                component(s) and/or system(s) is/are the sole responsibility of the Requestor.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || !formData.healthSafetyConfirmed}>
                {loading ? 'Creating Request...' : 'Create Service Request'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
