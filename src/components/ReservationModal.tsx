import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { X, Save, CreditCard as Edit, Calendar, Clock, User, Phone, DollarSign, FileText, Camera, Download } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { generatePDF } from '../utils/pdfGenerator';
import { TimeSelector } from './TimeSelector';
import { DateSelector } from './DateSelector';

interface ReservationModalProps {
  reservationId: string;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ reservationId, onClose }) => {
  const { reservations, staff, updateReservation } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const reservation = reservations.find(r => r.id === reservationId);
  
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    appointmentDate: '',
    appointmentTime: '',
    totalPrice: '',
    depositPaid: '',
    notes: '',
    artistId: ''
  });

  useEffect(() => {
    if (reservation) {
      setEditData({
        firstName: reservation.firstName,
        lastName: reservation.lastName,
        phone: reservation.phone,
        appointmentDate: reservation.appointmentDate,
        appointmentTime: reservation.appointmentTime,
        totalPrice: reservation.totalPrice.toString(),
        depositPaid: reservation.depositPaid.toString(),
        notes: reservation.notes || '',
        artistId: reservation.artistId || ''
      });
    }
  }, [reservation]);

  if (!reservation) {
    return null;
  }

  const getArtistName = (artistId?: string) => {
    if (!artistId) return 'Not assigned';
    const artist = staff.find(s => s.id === artistId);
    return artist?.name || 'Not assigned';
  };

  const getArtists = () => {
    return staff.filter(s => s.role === 'artist');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateReservation(reservationId, {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
        appointmentDate: editData.appointmentDate,
        appointmentTime: editData.appointmentTime,
        totalPrice: parseFloat(editData.totalPrice),
        depositPaid: parseFloat(editData.depositPaid),
        notes: editData.notes,
        artistId: editData.artistId || undefined
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('Error updating reservation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      firstName: reservation.firstName,
      lastName: reservation.lastName,
      phone: reservation.phone,
      appointmentDate: reservation.appointmentDate,
      appointmentTime: reservation.appointmentTime,
      totalPrice: reservation.totalPrice.toString(),
      depositPaid: reservation.depositPaid.toString(),
      notes: reservation.notes || '',
      artistId: reservation.artistId || ''
    });
    setIsEditing(false);
  };

  const handleDownloadPDF = () => {
    const artist = staff.find(s => s.id === reservation.artistId);
    generatePDF(reservation, artist?.name || 'Not assigned');
  };

  const remainingAmount = parseFloat(editData.totalPrice) - parseFloat(editData.depositPaid);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 border border-orange-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-orange-900">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-amber-700 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Reservation #{reservation.reservationNumber}
                </h2>
                <p className="text-gray-400">
                  Created: {new Date(reservation.createdAt).toLocaleDateString()} at {new Date(reservation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit Reservation"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="p-2 text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Download PDF"
                  >
                    <Download size={20} />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Client Information */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Client Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg">
                      {reservation.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg">
                      {reservation.lastName}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {reservation.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Appointment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  {isEditing ? (
                    <DateSelector
                      value={editData.appointmentDate}
                      onChange={(date) => setEditData(prev => ({ ...prev, appointmentDate: date }))}
                      className="bg-gray-600 border-gray-500"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg">
                      {new Date(reservation.appointmentDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                  {isEditing ? (
                    <TimeSelector
                      value={editData.appointmentTime}
                      onChange={(time) => setEditData(prev => ({ ...prev, appointmentTime: time }))}
                      className="bg-gray-600 border-gray-500"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {reservation.appointmentTime}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
                  {isEditing ? (
                    <select
                      value={editData.artistId}
                      onChange={(e) => setEditData(prev => ({ ...prev, artistId: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    >
                      <option value="">Select artist</option>
                      {getArtists().map(artist => (
                        <option key={artist.id} value={artist.id}>{artist.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg">
                      {getArtistName(reservation.artistId)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Total Price</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editData.totalPrice}
                      onChange={(e) => setEditData(prev => ({ ...prev, totalPrice: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg font-semibold">
                      €{reservation.totalPrice.toFixed(2)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deposit Paid</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editData.depositPaid}
                      onChange={(e) => setEditData(prev => ({ ...prev, depositPaid: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg font-semibold">
                      €{reservation.depositPaid.toFixed(2)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Remaining Amount</label>
                  <div className={`px-4 py-3 border border-gray-500 rounded-lg font-semibold ${
                    isEditing 
                      ? remainingAmount > 0 
                        ? 'bg-yellow-900/30 text-yellow-400' 
                        : 'bg-green-900/30 text-green-400'
                      : reservation.totalPrice - reservation.depositPaid > 0
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-green-900/30 text-green-400'
                  }`}>
                    €{isEditing ? remainingAmount.toFixed(2) : (reservation.totalPrice - reservation.depositPaid).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Payment Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-600 rounded-lg">
                  <span className="text-white">Deposit Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    reservation.depositPaidStatus
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {reservation.depositPaidStatus ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-600 rounded-lg">
                  <span className="text-white">Rest Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    reservation.restPaidStatus
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {reservation.restPaidStatus ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Design Images */}
            {reservation.designImages.length > 0 && (
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Design Images ({reservation.designImages.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {reservation.designImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImages(reservation.designImages);
                        setSelectedImageIndex(index);
                      }}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-600 hover:border-yellow-500 transition-colors"
                    >
                      <img
                        src={image}
                        alt={`Design ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Notes
              </h3>
              {isEditing ? (
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder-gray-400"
                  placeholder="Add notes about the reservation..."
                />
              ) : (
                <div className="px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg min-h-[100px]">
                  {reservation.notes || (
                    <span className="text-gray-400 italic">No notes added</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {isEditing && (
            <div className="flex justify-end space-x-4 p-6 border-t border-orange-900">
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-700 text-black rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all font-semibold flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedImages.length > 0 && (
        <ImageModal
          images={selectedImages}
          currentIndex={selectedImageIndex}
          onClose={() => {
            setSelectedImages([]);
            setSelectedImageIndex(0);
          }}
          onNavigate={setSelectedImageIndex}
        />
      )}
    </>
  );
};