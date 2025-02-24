import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

const STORAGE_KEY = '@notes_storage';
const SETTINGS_KEY = '@app_settings';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  timestamp: number;
  titleFont: string;
  contentFont: string;
}

interface AppSettings {
  darkMode: boolean;
  fontSize: number;
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedTitleFont, setSelectedTitleFont] = useState('System');
  const [selectedContentFont, setSelectedContentFont] = useState('System');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    fontSize: 1.0,
  });

  const [showAbout, setShowAbout] = useState(false);

  const drawerAnimation = useRef(new Animated.Value(0)).current;

  const fonts = [
    // Sans-Serif Fonts
    'System',
    'Roboto',
    'Arial',
    'Helvetica',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Calibri',
    'Open Sans',
    'Segoe UI',
    'Noto Sans',
    'Lato',
    'Montserrat',

    // Serif Fonts
    'Times New Roman',
    'Georgia',
    'Palatino',
    'Garamond',
    'Baskerville',
    'Cambria',
    'Didot',
    'Book Antiqua',
    'Goudy Old Style',
    'Perpetua',
    'Playfair Display',
    'Merriweather',

    // Monospace Fonts
    'Courier',
    'Courier New',
    'Consolas',
    'Monaco',
    'Lucida Console',
    'Menlo',
    'Source Code Pro',
    'Fira Code',
    'Ubuntu Mono',
    'IBM Plex Mono',

    // Display & Decorative
    'Impact',
    'Comic Sans MS',
    'Copperplate',
    'Papyrus',
    'Brush Script MT',
    'Luminari',
    'Chalkboard',
    'Jazz LET',
    'Trattatello',
    'Party LET',

    // Modern & Professional
    'Futura',
    'Century Gothic',
    'Optima',
    'Gill Sans',
    'Avenir',
    'Proxima Nova',
    'Myriad Pro',
    'Brandon Grotesque',
    'DM Sans',
    'Inter'
  ];

  const colors = ['#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb'];

  useEffect(() => {
    loadNotes();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? 0 : 1;
    Animated.timing(drawerAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsDrawerOpen(!isDrawerOpen);
  };

  const drawerTranslateX = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const addNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const newNoteItem: Note = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        color: selectedColor,
        isPinned: false,
        timestamp: Date.now(),
        titleFont: selectedTitleFont,
        contentFont: selectedContentFont,
      };

      const updatedNotes = [newNoteItem, ...notes];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setIsAddingNote(false);
      setNewNote({ title: '', content: '' });
      setSelectedColor('#ffffff');
    }
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const togglePin = (id: string) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp - a.timestamp;
  });

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[
        styles.note, 
        { 
          backgroundColor: settings.darkMode ? '#333' : item.color,
        }
      ]}
      onLongPress={() => deleteNote(item.id)}>
      <View style={styles.noteHeader}>
        <Text 
          style={[
            styles.noteTitle, 
            { 
              fontFamily: item.titleFont,
              fontSize: 16 * settings.fontSize,
              color: settings.darkMode ? '#fff' : '#000',
            }
          ]}
        >
          {item.title}
        </Text>
        <TouchableOpacity onPress={() => togglePin(item.id)}>
          <MaterialIcons
            name={item.isPinned ? 'push-pin' : 'push-pin-outlined'}
            size={20}
            color={settings.darkMode ? '#fff' : '#666'}
          />
        </TouchableOpacity>
      </View>
      <Text 
        style={[
          styles.noteContent, 
          { 
            fontFamily: item.contentFont,
            fontSize: 14 * settings.fontSize,
            color: settings.darkMode ? '#ccc' : '#666',
          }
        ]}
      >
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: settings.darkMode ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <View style={[
        styles.header,
        { backgroundColor: settings.darkMode ? '#2d2d2d' : 'white' }
      ]}>
        <View style={styles.headerTop}>
          <Text style={[
            styles.appTitle,
            { color: settings.darkMode ? '#fff' : '#000' }
          ]}>Notes</Text>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <MaterialIcons 
              name="menu" 
              size={24} 
              color={settings.darkMode ? '#fff' : '#666'} 
            />
          </TouchableOpacity>
        </View>
        <View style={[
          styles.searchBar,
          { backgroundColor: settings.darkMode ? '#404040' : '#f5f5f5' }
        ]}>
          <MaterialIcons 
            name="search" 
            size={24} 
            color={settings.darkMode ? '#fff' : '#666'} 
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: settings.darkMode ? '#fff' : '#000' }
            ]}
            placeholder="Search notes..."
            placeholderTextColor={settings.darkMode ? '#999' : '#666'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isAddingNote ? (
        <View style={[
          styles.fullScreenNote,
          { backgroundColor: settings.darkMode ? '#2d2d2d' : selectedColor }
        ]}>
          <View style={styles.noteHeader}>
            <View style={styles.titleContainer}>
              <TextInput
                style={[
                  styles.titleInput,
                  { 
                    fontFamily: selectedTitleFont,
                    color: settings.darkMode ? '#fff' : '#000',
                    fontSize: 20 * settings.fontSize,
                  }
                ]}
                placeholder="Title"
                placeholderTextColor={settings.darkMode ? '#999' : '#666'}
                value={newNote.title}
                onChangeText={text => setNewNote(prev => ({ ...prev, title: text }))}
              />
              <View style={styles.titleControls}>
                <TouchableOpacity 
                  style={styles.fontButton}
                  onPress={() => setShowFontPicker(!showFontPicker)}>
                  <MaterialIcons 
                    name="font-download" 
                    size={24} 
                    color={settings.darkMode ? '#fff' : '#666'} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setIsAddingNote(false);
                    setNewNote({ title: '', content: '' });
                  }}>
                  <MaterialIcons 
                    name="close" 
                    size={24} 
                    color={settings.darkMode ? '#fff' : '#666'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {showFontPicker && (
            <View style={[
              styles.fontPickerContainer,
              { backgroundColor: settings.darkMode ? '#404040' : '#f5f5f5' }
            ]}>
              <Text style={[
                styles.fontPickerTitle,
                { color: settings.darkMode ? '#fff' : '#666' }
              ]}>Title Font</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontPicker}>
                {fonts.map(font => (
                  <TouchableOpacity
                    key={font}
                    style={[
                      styles.fontOption,
                      selectedTitleFont === font && styles.selectedFont,
                      { backgroundColor: settings.darkMode ? '#333' : '#f0f0f0' }
                    ]}
                    onPress={() => setSelectedTitleFont(font)}>
                    <Text style={[
                      styles.fontText,
                      { 
                        fontFamily: font,
                        color: settings.darkMode ? '#fff' : '#333'
                      }
                    ]}>{font}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <Text style={[
                styles.fontPickerTitle,
                { color: settings.darkMode ? '#fff' : '#666' }
              ]}>Content Font</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontPicker}>
                {fonts.map(font => (
                  <TouchableOpacity
                    key={font}
                    style={[
                      styles.fontOption,
                      selectedContentFont === font && styles.selectedFont,
                      { backgroundColor: settings.darkMode ? '#333' : '#f0f0f0' }
                    ]}
                    onPress={() => setSelectedContentFont(font)}>
                    <Text style={[
                      styles.fontText,
                      { 
                        fontFamily: font,
                        color: settings.darkMode ? '#fff' : '#333'
                      }
                    ]}>{font}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <TextInput
            style={[
              styles.contentInput,
              { 
                fontFamily: selectedContentFont,
                color: settings.darkMode ? '#fff' : '#000',
                fontSize: 16 * settings.fontSize,
              }
            ]}
            placeholder="Start typing your note..."
            placeholderTextColor={settings.darkMode ? '#999' : '#666'}
            multiline
            value={newNote.content}
            onChangeText={text => setNewNote(prev => ({ ...prev, content: text }))}
          />
          
          <View style={styles.bottomControls}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.colorPicker}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption, 
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.addNoteActions}>
              <TouchableOpacity 
                style={[
                  styles.button,
                  { backgroundColor: settings.darkMode ? '#666' : '#2196f3' }
                ]} 
                onPress={addNote}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={sortedNotes}
          renderItem={renderNote}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.notesContainer}
        />
      )}

      {!isAddingNote && (
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: settings.darkMode ? '#666' : '#2196f3' }
          ]}
          onPress={() => setIsAddingNote(true)}>
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      <Animated.View 
        style={[
          styles.drawer,
          { 
            transform: [{ translateX: drawerTranslateX }],
            backgroundColor: settings.darkMode ? '#2d2d2d' : 'white',
          }
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={[
            styles.drawerTitle,
            { color: settings.darkMode ? '#fff' : '#000' }
          ]}>Menu</Text>
          <TouchableOpacity onPress={toggleDrawer}>
            <MaterialIcons 
              name="close" 
              size={24} 
              color={settings.darkMode ? '#fff' : '#666'} 
            />
          </TouchableOpacity>
        </View>        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={() => {
            setShowAbout(true);
            toggleDrawer();
          }}>
          <MaterialIcons 
            name="info" 
            size={24} 
            color={settings.darkMode ? '#fff' : '#666'} 
          />
          <Text style={[
            styles.drawerItemText,
            { color: settings.darkMode ? '#fff' : '#000' }
          ]}>About</Text>
        </TouchableOpacity>

        <View style={styles.drawerSection}>
          <Text style={[
            styles.drawerSectionTitle,
            { color: settings.darkMode ? '#fff' : '#666' }
          ]}>Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={[
              styles.settingLabel,
              { color: settings.darkMode ? '#fff' : '#000' }
            ]}>Dark Mode</Text>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => saveSettings({ ...settings, darkMode: value })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.darkMode ? '#2196f3' : '#f4f3f4'}
            />
          </View>          <View style={styles.settingItem}>
            <Text style={[
              styles.settingLabel,
              { color: settings.darkMode ? '#fff' : '#000' }
            ]}>Text Size</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>
                {Math.round(settings.fontSize * 100)}%
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0.8}
                maximumValue={1.5}
                step={0.1}
                value={settings.fontSize}
                onValueChange={(value) => saveSettings({ ...settings, fontSize: value })}
                minimumTrackTintColor="#2196f3"
                maximumTrackTintColor={settings.darkMode ? '#666' : '#ccc'}
                thumbTintColor="#2196f3"
              />
            </View>
          </View>
        </View>      </Animated.View>

      {showAbout && (
        <View style={[
          styles.aboutContainer,
          { backgroundColor: settings.darkMode ? '#1a1a1a' : '#fff' }
        ]}>
          <View style={styles.aboutHeader}>
            <Text style={[
              styles.aboutTitle,
              { color: settings.darkMode ? '#fff' : '#000' }
            ]}>About Notes App</Text>
            <TouchableOpacity 
              style={styles.closeAbout}
              onPress={() => setShowAbout(false)}>
              <MaterialIcons 
                name="close" 
                size={24} 
                color={settings.darkMode ? '#fff' : '#666'} 
              />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.aboutContent}>
            <Text style={[
              styles.aboutText,
              { color: settings.darkMode ? '#fff' : '#000' }
            ]}>
              Welcome to Notes App - Your Personal Offline Note-Taking Solution
            </Text>
            
            <Text style={[
              styles.aboutSection,
              { color: settings.darkMode ? '#ccc' : '#666' }
            ]}>
              Developed with ❤️ by passionate developers who believe in privacy and simplicity.
            </Text>

            <Text style={[
              styles.aboutSection,
              { color: settings.darkMode ? '#ccc' : '#666' }
            ]}>
              Features:
              {'\n'}- Create and organize notes
              {'\n'}- Customize with beautiful fonts
              {'\n'}- Color code your notes
              {'\n'}- Pin important notes
              {'\n'}- Dark mode support
              {'\n'}- Completely offline
              {'\n'}- No account needed
            </Text>

            <Text style={[
              styles.aboutSection,
              { color: settings.darkMode ? '#ccc' : '#666' }
            ]}>
              Version 1.0.0
              {'\n'}© 2024 Notes App. All rights reserved.
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  aboutContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeAbout: {
    padding: 8,
  },
  aboutContent: {
    padding: 16,
  },
  aboutText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  aboutSection: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  sliderContainer: {
    width: '100%',
  },
  sliderValue: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuButton: {
    padding: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    padding: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 300,
    height: '100%',
    backgroundColor: 'white',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  drawerItemText: {
    marginLeft: 16,
    fontSize: 16,
  },
  drawerSection: {
    marginTop: 20,
  },
  drawerSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  notesContainer: {
    padding: 8,
  },
  note: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 100,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2196f3',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fullScreenNote: {
    flex: 1,
    backgroundColor: 'white',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  titleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fontButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  contentInput: {
    fontSize: 16,
    flex: 1,
    textAlignVertical: 'top',
    padding: 16,
    paddingTop: 8,
  },
  bottomControls: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  fontPickerContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fontPickerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  fontPicker: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  fontOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedFont: {
    backgroundColor: '#2196f3',
  },
  fontText: {
    fontSize: 14,
    color: '#333',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 16,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  addNoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});