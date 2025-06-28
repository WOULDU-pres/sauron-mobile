import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Modal, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  style?: any;
}

export function DatePickerWithRange({
  date,
  setDate,
  style,
}: DatePickerWithRangeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPicker, setCurrentPicker] = useState<'from' | 'to'>('from');
  const [tempFromDate, setTempFromDate] = useState<Date>(date?.from || new Date());
  const [tempToDate, setTempToDate] = useState<Date>(date?.to || new Date());

  const handleDateConfirm = (selectedDate: Date) => {
    if (currentPicker === 'from') {
      setTempFromDate(selectedDate);
      setCurrentPicker('to');
    } else {
      setTempToDate(selectedDate);
      setIsModalOpen(false);
      
      // 날짜 범위 업데이트
      setDate({
        from: tempFromDate,
        to: selectedDate,
      });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentPicker('from');
  };

  const openPicker = () => {
    setCurrentPicker('from');
    setTempFromDate(date?.from || new Date());
    setTempToDate(date?.to || new Date());
    setIsModalOpen(true);
  };

  const getDisplayText = () => {
    if (date?.from && date?.to) {
      return `${format(date.from, 'yyyy.MM.dd', { locale: ko })} - ${format(date.to, 'yyyy.MM.dd', { locale: ko })}`;
    }
    if (date?.from) {
      return format(date.from, 'yyyy.MM.dd', { locale: ko });
    }
    return '기간 선택';
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          !date?.from && styles.buttonPlaceholder
        ]}
        onPress={openPicker}
      >
        <Calendar size={16} color="#6B7280" style={styles.icon} />
        <Text style={[
          styles.buttonText,
          !date?.from && styles.placeholderText
        ]}>
          {getDisplayText()}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentPicker === 'from' ? '시작 날짜 선택' : '종료 날짜 선택'}
              </Text>
            </View>
            
            <DatePicker
              date={currentPicker === 'from' ? tempFromDate : tempToDate}
              onDateChange={currentPicker === 'from' ? setTempFromDate : setTempToDate}
              mode="date"
              locale="ko"
              style={styles.datePicker}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => handleDateConfirm(currentPicker === 'from' ? tempFromDate : tempToDate)}
              >
                <Text style={styles.confirmButtonText}>
                  {currentPicker === 'from' ? '다음' : '확인'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 40,
  },
  buttonPlaceholder: {
    borderColor: '#D1D5DB',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: 'normal',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  datePicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 