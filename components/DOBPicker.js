import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Modal, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function DOBPicker({ visible, onClose, onSave, initialDate }) {
    // Fallback to 20 years ago if no date provided
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 20);
    
    const [date, setDate] = useState(initialDate || defaultDate);
    const [day, setDay] = useState(date.getDate());
    const [month, setMonth] = useState(date.getMonth());
    const [year, setYear] = useState(date.getFullYear());

    useEffect(() => {
        if (initialDate) {
            setDate(initialDate);
            setDay(initialDate.getDate());
            setMonth(initialDate.getMonth());
            setYear(initialDate.getFullYear());
        }
    }, [initialDate, visible]);

    // Generate years (e.g., from 1920 to 10 years ago)
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 100; i <= currentYear - 10; i++) {
        years.push(i);
    }
    years.reverse();

    // Generate days based on month and year
    const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
    const daysCount = getDaysInMonth(month, year);
    const days = Array.from({ length: daysCount }, (_, i) => i + 1);

    const handleSave = () => {
        const newDate = new Date(year, month, Math.min(day, daysCount));
        onSave(newDate);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={s.overlay}>
                <View style={s.sheet}>
                    <View style={s.header}>
                        <Text style={s.title}>Select Date of Birth</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={s.close}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={s.pickerRow}>
                        {/* Day */}
                        <View style={s.pickerCol}>
                            <Text style={s.label}>Day</Text>
                            <Picker
                                selectedValue={day}
                                onValueChange={(v) => setDay(v)}
                                style={s.picker}
                                itemStyle={s.itemStyle}
                            >
                                {days.map(d => <Picker.Item key={d} label={String(d)} value={d} />)}
                            </Picker>
                        </View>

                        {/* Month */}
                        <View style={[s.pickerCol, { flex: 1.5 }]}>
                            <Text style={s.label}>Month</Text>
                            <Picker
                                selectedValue={month}
                                onValueChange={(v) => setMonth(v)}
                                style={s.picker}
                                itemStyle={s.itemStyle}
                            >
                                {MONTHS.map((m, i) => <Picker.Item key={m} label={m} value={i} />)}
                            </Picker>
                        </View>

                        {/* Year */}
                        <View style={s.pickerCol}>
                            <Text style={s.label}>Year</Text>
                            <Picker
                                selectedValue={year}
                                onValueChange={(v) => setYear(v)}
                                style={s.picker}
                                itemStyle={s.itemStyle}
                            >
                                {years.map(y => <Picker.Item key={y} label={String(y)} value={y} />)}
                            </Picker>
                        </View>
                    </View>

                    <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                        <Text style={s.saveText}>Confirm Date</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { 
        backgroundColor: '#fff', 
        borderTopLeftRadius: 24, 
        borderTopRightRadius: 24, 
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingHorizontal: 16,
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        marginBottom: 10,
    },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1A237E' },
    close: { fontSize: 16, color: '#666', fontWeight: '500' },
    pickerRow: { flexDirection: 'row', gap: 4, height: 200, alignItems: 'center' },
    pickerCol: { flex: 1 },
    label: { 
        textAlign: 'center', 
        fontSize: 12, 
        color: '#999', 
        fontWeight: 'bold', 
        textTransform: 'uppercase',
        marginBottom: -10,
        zIndex: 1
    },
    picker: { width: '100%' },
    itemStyle: { fontSize: 18, color: '#1A237E' },
    saveBtn: { 
        backgroundColor: '#1A237E', 
        borderRadius: 14, 
        paddingVertical: 15, 
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#1A237E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
