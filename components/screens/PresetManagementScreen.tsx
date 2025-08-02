import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { usePreset } from '../../contexts/PresetContext';
import { Preset, TodoItem } from '../../types/preset';

interface PresetManagementScreenProps {
  onClose: () => void;
}

const PresetManagementScreen: React.FC<PresetManagementScreenProps> = ({ onClose }) => {
  const { presets, addPreset, updatePreset, deletePreset } = usePreset();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const isDarkMode = useColorScheme() === 'dark';

  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetEmoji, setNewPresetEmoji] = useState('');
  const [newPresetColor, setNewPresetColor] = useState('#3B82F6');
  const [newPresetTargetTime, setNewPresetTargetTime] = useState(30);
  const [newPresetTodos, setNewPresetTodos] = useState<TodoItem[]>([
    { id: '1', title: '', color: '#3B82F6' }
  ]);

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const emojis = ['💻', '📚', '🏋️', '✍️', '🍳', '🎨', '🧘', '🎵', '🎮', '📱', '💡', '🔬', '🌱', '🚀', '⚡', '🎯', '📊', '🔥', '💪', '🌟'];

  const handleAddTodo = () => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title: '',
      color: '#3B82F6',
    };
    setNewPresetTodos([...newPresetTodos, newTodo]);
  };

  const handleUpdateTodo = (index: number, field: keyof TodoItem, value: string | number) => {
    const updatedTodos = [...newPresetTodos];
    if (field === 'title') {
      updatedTodos[index].title = value as string;
    } else if (field === 'color') {
      updatedTodos[index].color = value as string;
    }
    setNewPresetTodos(updatedTodos);
  };

  const handleRemoveTodo = (index: number) => {
    if (newPresetTodos.length > 1) {
      const updatedTodos = newPresetTodos.filter((_, i) => i !== index);
      setNewPresetTodos(updatedTodos);
    }
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      Alert.alert('오류', '프리셋 이름을 입력해주세요.');
      return;
    }

    const validTodos = newPresetTodos.filter(todo => todo.title.trim() !== '');
    if (validTodos.length === 0) {
      Alert.alert('오류', '최소 하나의 할일을 입력해주세요.');
      return;
    }

    const preset: Preset = {
      id: editingPreset?.id || Date.now().toString(),
      name: newPresetName,
      emoji: newPresetEmoji || undefined,
      color: newPresetColor,
      targetTime: newPresetTargetTime,
      todos: validTodos,
      createdAt: editingPreset?.createdAt || new Date(),
      usageCount: editingPreset?.usageCount || 0,
      lastUsed: editingPreset?.lastUsed || new Date(),
    };

    if (editingPreset) {
      updatePreset(preset);
    } else {
      addPreset({
        name: preset.name,
        emoji: preset.emoji,
        color: preset.color,
        targetTime: preset.targetTime,
        todos: preset.todos,
      });
    }

    handleCloseModal();
  };

  const handleEditPreset = (preset: Preset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setNewPresetEmoji(preset.emoji || '');
    setNewPresetColor(preset.color);
    setNewPresetTargetTime(preset.targetTime);
    setNewPresetTodos([...preset.todos]);
    setShowAddModal(true);
  };

  const handleDeletePreset = (presetId: string) => {
    Alert.alert(
      '프리셋 삭제',
      '정말로 이 프리셋을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => deletePreset(presetId) },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPreset(null);
    setNewPresetName('');
    setNewPresetEmoji('');
    setNewPresetColor('#3B82F6');
    setNewPresetTargetTime(30);
    setNewPresetTodos([{ id: '1', title: '', color: '#3B82F6' }]);
  };

  const backgroundColor = isDarkMode ? '#1a202c' : '#f8f8f8';
  const cardBackgroundColor = isDarkMode ? '#2d3748' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const secondaryTextColor = isDarkMode ? '#a0aec0' : '#718096';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: cardBackgroundColor }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>프리셋 관리</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* 프리셋 목록 */}
      <ScrollView style={styles.content}>
        {presets.map((preset) => (
          <View key={preset.id} style={[styles.presetCard, { backgroundColor: cardBackgroundColor }]}>
            <View style={styles.presetHeader}>
              <View style={styles.presetInfo}>
                {preset.emoji ? (
                  <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                ) : (
                  <View style={[styles.colorIndicator, { backgroundColor: preset.color }]} />
                )}
                <Text style={[styles.presetName, { color: textColor }]}>{preset.name}</Text>
              </View>
              <View style={styles.presetActions}>
                <TouchableOpacity onPress={() => handleEditPreset(preset)} style={styles.actionButton}>
                  <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePreset(preset.id)} style={styles.actionButton}>
                  <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.targetTimeText, { color: secondaryTextColor }]}>
              목표 시간: {preset.targetTime}분
            </Text>
            <View style={styles.todoList}>
              {preset.todos.map((todo, index) => (
                <Text key={todo.id} style={[styles.todoItem, { color: secondaryTextColor }]}>
                  {index + 1}. {todo.title}
                </Text>
              ))}
            </View>
            <Text style={[styles.usageInfo, { color: secondaryTextColor }]}>
              사용 횟수: {preset.usageCount}회
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* 프리셋 추가/편집 모달 */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {editingPreset ? '프리셋 수정' : '새 프리셋'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* 프리셋 이름 */}
              <Text style={[styles.label, { color: textColor }]}>프리셋 이름</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDarkMode ? '#4a5568' : '#f7fafc', color: textColor }]}
                value={newPresetName}
                onChangeText={setNewPresetName}
                placeholder="프리셋 이름을 입력하세요"
                placeholderTextColor={secondaryTextColor}
              />

              {/* 프리셋 이모지 선택 */}
              <Text style={[styles.label, { color: textColor }]}>프리셋 이모지 (선택사항)</Text>
              <View style={styles.emojiPicker}>
                <TouchableOpacity
                  style={[
                    styles.emojiOption,
                    !newPresetEmoji && styles.selectedEmoji,
                    { borderColor: isDarkMode ? '#4a5568' : '#e2e8f0' }
                  ]}
                  onPress={() => setNewPresetEmoji('')}
                >
                  <Text style={[styles.emojiText, { color: textColor, fontSize: 12 }]}>없음</Text>
                </TouchableOpacity>
                {emojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      newPresetEmoji === emoji && styles.selectedEmoji,
                      { borderColor: isDarkMode ? '#4a5568' : '#e2e8f0' }
                    ]}
                    onPress={() => setNewPresetEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 프리셋 색상 선택 */}
              <Text style={[styles.label, { color: textColor }]}>프리셋 색상</Text>
              <View style={styles.colorPicker}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newPresetColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setNewPresetColor(color)}
                  />
                ))}
              </View>

              {/* 목표 시간 설정 */}
              <Text style={[styles.label, { color: textColor }]}>목표 시간 (분)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDarkMode ? '#4a5568' : '#f7fafc', color: textColor }]}
                value={newPresetTargetTime.toString()}
                onChangeText={(text) => setNewPresetTargetTime(parseInt(text) || 0)}
                placeholder="목표 시간을 입력하세요"
                placeholderTextColor={secondaryTextColor}
                keyboardType="numeric"
              />

              {/* 할일 목록 */}
              <View style={styles.todosSection}>
                <View style={styles.todosHeader}>
                  <Text style={[styles.label, { color: textColor }]}>할일 목록</Text>
                  <TouchableOpacity onPress={handleAddTodo} style={styles.addTodoButton}>
                    <Text style={styles.addTodoButtonText}>+ 할일 추가</Text>
                  </TouchableOpacity>
                </View>

                {newPresetTodos.map((todo, index) => (
                  <View key={todo.id} style={styles.todoInputContainer}>
                    <View style={styles.todoInputRow}>
                      <TextInput
                        style={[styles.todoTitleInput, { backgroundColor: isDarkMode ? '#4a5568' : '#f7fafc', color: textColor }]}
                        value={todo.title}
                        onChangeText={(text) => handleUpdateTodo(index, 'title', text)}
                        placeholder="할일 제목"
                        placeholderTextColor={secondaryTextColor}
                      />
                      {newPresetTodos.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveTodo(index)} style={styles.removeTodoButton}>
                          <Text style={styles.removeTodoButtonText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.todoColorPicker}>
                      {colors.map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.todoColorOption,
                            { backgroundColor: color },
                            todo.color === color && styles.selectedTodoColor,
                          ]}
                          onPress={() => handleUpdateTodo(index, 'color', color)}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={handleCloseModal} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSavePreset} style={[styles.modalButton, styles.saveButton]}>
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  presetCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  presetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  presetName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  presetEmoji: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
    marginRight: 12,
  },
  presetActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  todoList: {
    marginBottom: 8,
  },
  todoItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  targetTimeText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  usageInfo: {
    fontSize: 12,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
  },
  emojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectedEmoji: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  emojiText: {
    fontSize: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  todosSection: {
    marginTop: 16,
  },
  todosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addTodoButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addTodoButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  todoInputContainer: {
    marginBottom: 16,
  },
  todoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  todoColorPicker: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 4,
  },
  todoColorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTodoColor: {
    borderColor: '#000',
  },
  todoTitleInput: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  removeTodoButton: {
    width: 30,
    height: 30,
    backgroundColor: '#EF4444',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTodoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PresetManagementScreen;