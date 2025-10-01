import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Reservation {
  id: string;
  reservationNumber: number;
  firstName: string;
  lastName: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  totalPrice: number;
  depositPaid: number;
  isPaid: boolean;
  depositPaidStatus: boolean;
  restPaidStatus: boolean;
  designImages: string[];
  notes?: string;
  artistId?: string;
  createdAt: string;
}

interface Staff {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'staff' | 'artist';
  permissions: string[];
  createdAt: string;
}

interface DataContextType {
  reservations: Reservation[];
  staff: Staff[];
  loading: boolean;
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => Promise<void>;
  updateReservation: (id: string, reservation: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  addStaff: (staff: Omit<Staff, 'id' | 'createdAt'>) => Promise<void>;
  updateStaff: (id: string, staff: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  getArtists: () => Staff[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('Error loading reservations:', error);
        return;
      }

      const formattedReservations: Reservation[] = data.map(item => ({
        id: item.id,
        reservationNumber: item.reservation_number,
        firstName: item.first_name,
        lastName: item.last_name,
        phone: item.phone,
        appointmentDate: item.appointment_date,
        appointmentTime: item.appointment_time,
        totalPrice: item.total_price,
        depositPaid: item.deposit_paid,
        isPaid: item.is_paid,
        depositPaidStatus: item.deposit_paid_status || false,
        restPaidStatus: item.rest_paid_status || false,
        designImages: item.design_images || [],
        notes: item.notes || '',
        artistId: item.artist_id || '',
        createdAt: item.created_at
      }));

      setReservations(formattedReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  };

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading staff:', error);
        return;
      }

      const formattedStaff: Staff[] = data.map(item => ({
        id: item.id,
        name: item.name,
        username: item.username,
        password: item.password,
        role: item.role,
        permissions: item.permissions,
        createdAt: item.created_at
      }));

      setStaff(formattedStaff);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([loadReservations(), loadStaff()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  // Don't render children until we have a user context
  if (!user) {
    return <>{children}</>;
  }

  const addReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt'>) => {
    try {
      // Get the highest reservation number and increment
      const { data: maxReservation } = await supabase
        .from('reservations')
        .select('reservation_number')
        .order('reservation_number', { ascending: false })
        .limit(1);
      
      const nextReservationNumber = maxReservation && maxReservation.length > 0 
        ? maxReservation[0].reservation_number + 1 
        : 1290;

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          reservation_number: nextReservationNumber,
          first_name: reservation.firstName,
          last_name: reservation.lastName,
          phone: reservation.phone,
          appointment_date: reservation.appointmentDate,
          appointment_time: reservation.appointmentTime,
          total_price: reservation.totalPrice,
          deposit_paid: reservation.depositPaid,
          is_paid: reservation.isPaid,
          deposit_paid_status: reservation.depositPaidStatus || false,
          rest_paid_status: reservation.restPaidStatus || false,
          design_images: reservation.designImages,
          notes: reservation.notes,
          artist_id: reservation.artistId || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding reservation:', error);
        throw error;
      }

      await loadReservations();
      
      // Send Telegram notification for new reservation
      try {
        const artistName = reservation.artistId 
          ? staff.find(s => s.id === reservation.artistId)?.name 
          : undefined;
        
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-telegram-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reservation: {
              reservationNumber: nextReservationNumber,
              firstName: reservation.firstName,
              lastName: reservation.lastName,
              phone: reservation.phone,
              appointmentDate: reservation.appointmentDate,
              appointmentTime: reservation.appointmentTime,
              totalPrice: reservation.totalPrice,
              depositPaid: reservation.depositPaid,
              artistName
            }
          })
        });
      } catch (telegramError) {
        // Don't fail the reservation creation if Telegram notification fails
        console.warn('Failed to send Telegram notification:', telegramError);
      }
    } catch (error) {
      console.error('Error adding reservation:', error);
      throw error;
    }
  };

  const updateReservation = async (id: string, updatedReservation: Partial<Reservation>) => {
    try {
      const updateData: any = {};
      
      if (updatedReservation.firstName !== undefined) updateData.first_name = updatedReservation.firstName;
      if (updatedReservation.lastName !== undefined) updateData.last_name = updatedReservation.lastName;
      if (updatedReservation.phone !== undefined) updateData.phone = updatedReservation.phone;
      if (updatedReservation.appointmentDate !== undefined) updateData.appointment_date = updatedReservation.appointmentDate;
      if (updatedReservation.appointmentTime !== undefined) updateData.appointment_time = updatedReservation.appointmentTime;
      if (updatedReservation.totalPrice !== undefined) updateData.total_price = updatedReservation.totalPrice;
      if (updatedReservation.depositPaid !== undefined) updateData.deposit_paid = updatedReservation.depositPaid;
      if (updatedReservation.isPaid !== undefined) updateData.is_paid = updatedReservation.isPaid;
      if (updatedReservation.depositPaidStatus !== undefined) updateData.deposit_paid_status = updatedReservation.depositPaidStatus;
      if (updatedReservation.restPaidStatus !== undefined) updateData.rest_paid_status = updatedReservation.restPaidStatus;
      if (updatedReservation.designImages !== undefined) updateData.design_images = updatedReservation.designImages;
      if (updatedReservation.notes !== undefined) updateData.notes = updatedReservation.notes;
      if (updatedReservation.artistId !== undefined) updateData.artist_id = updatedReservation.artistId || null;

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating reservation:', error);
        throw error;
      }

      await loadReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reservation:', error);
        throw error;
      }

      await loadReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  };

  const addStaff = async (staffMember: Omit<Staff, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: staffMember.name,
          username: staffMember.username,
          password: staffMember.password,
          role: staffMember.role,
          permissions: staffMember.permissions
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding staff:', error);
        throw error;
      }

      await loadStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
      throw error;
    }
  };

  const updateStaff = async (id: string, updatedStaff: Partial<Staff>) => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (updatedStaff.name !== undefined) updateData.name = updatedStaff.name;
      if (updatedStaff.username !== undefined) updateData.username = updatedStaff.username;
      if (updatedStaff.password !== undefined) updateData.password = updatedStaff.password;
      if (updatedStaff.role !== undefined) updateData.role = updatedStaff.role;
      if (updatedStaff.permissions !== undefined) updateData.permissions = updatedStaff.permissions;

      const { error } = await supabase
        .from('staff')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating staff:', error);
        throw error;
      }

      await loadStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting staff:', error);
        throw error;
      }

      await loadStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  };

  const getArtists = () => {
    return staff.filter(s => s.role === 'artist');
  };

  return (
    <DataContext.Provider value={{
      reservations,
      staff,
      loading,
      addReservation,
      updateReservation,
      deleteReservation,
      addStaff,
      updateStaff,
      deleteStaff,
      getArtists,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};