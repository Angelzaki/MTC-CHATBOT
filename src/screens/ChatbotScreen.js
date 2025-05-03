import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  // Cargar usuario y mensajes previos
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadMessages(currentUser.uid);
      } else {
        setUser(null);
        setMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cargar mensajes del usuario desde Firestore
  const loadMessages = async (userId) => {
    try {
      setLoading(true);
      const messagesRef = collection(db, "ChatMessages");
      // Consulta sin orderBy para evitar la necesidad de índices compuestos
      const q = query(
        messagesRef,
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      let loadedMessages = [];
      
      if (querySnapshot.empty) {
        // Si no hay mensajes, agregar mensaje de bienvenida
        const welcomeMessage = {
          id: Date.now().toString(),
          sender: 'bot',
          text: 'Hola, soy InnovaEdu. ¿En qué puedo ayudarte sobre normas de tránsito?',
          timestamp: new Date()
        };
        
        // Guardar el mensaje de bienvenida en Firestore
        await addDoc(collection(db, "ChatMessages"), {
          userId: userId,
          sender: welcomeMessage.sender,
          text: welcomeMessage.text,
          timestamp: welcomeMessage.timestamp
        });
        
        loadedMessages.push(welcomeMessage);
      } else {
        // Cargar mensajes existentes
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedMessages.push({
            id: doc.id,
            sender: data.sender,
            text: data.text,
            timestamp: data.timestamp instanceof Date ? data.timestamp : data.timestamp.toDate()
          });
        });
        
        // Ordenar mensajes por timestamp después de cargarlos
        // Esto evita la necesidad de índices compuestos en Firestore
        loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
      }
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
      Alert.alert("Error", "No se pudieron cargar los mensajes anteriores");
    } finally {
      setLoading(false);
    }
  };

  // Guardar mensaje en Firestore
  const saveMessage = async (message, sender) => {
    try {
      if (!user) return;
      
      const docRef = await addDoc(collection(db, "ChatMessages"), {
        userId: user.uid,
        sender: sender,
        text: message,
        timestamp: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error("Error al guardar mensaje:", error);
      return null;
    }
  };

  // Enviar mensaje
  const sendMessage = async () => {
    if (input.trim() === '' || !user || isSending) return;
    
    setIsSending(true);
    const userMessageText = input.trim();
    setInput('');

    try {
      // Guardar mensaje del usuario en Firestore
      const userMessageId = await saveMessage(userMessageText, 'user');
      
      // Agregar mensaje del usuario a la UI
      const userMessage = {
        id: userMessageId || Date.now().toString(),
        sender: 'user',
        text: userMessageText,
        timestamp: new Date()
      };
      
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Enviar mensaje a la API
      const response = await fetch('http://192.168.100.8:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessageText }),
      });

      const data = await response.json();
      const botResponse = data.reply || 'Lo siento, hubo un problema procesando tu mensaje.';
      
      // Guardar respuesta del bot en Firestore
      const botMessageId = await saveMessage(botResponse, 'bot');
      
      // Agregar respuesta del bot a la UI
      const botMessage = {
        id: botMessageId || Date.now().toString(),
        sender: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      
      // Mensaje de error si falla la conexión
      const errorMessage = {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Error al conectar con el servidor.',
        timestamp: new Date()
      };
      
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      await saveMessage(errorMessage.text, 'bot');
    } finally {
      setIsSending(false);
    }
  };

  // Eliminar todas las conversaciones
  const deleteAllMessages = async () => {
    if (!user) return;
    
    Alert.alert(
      "Eliminar conversación",
      "¿Estás seguro que deseas eliminar toda la conversación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              
              // Obtener todos los mensajes del usuario
              const messagesRef = collection(db, "ChatMessages");
              const q = query(messagesRef, where("userId", "==", user.uid));
              const querySnapshot = await getDocs(q);
              
              // Eliminar cada mensaje
              const deletePromises = [];
              querySnapshot.forEach((document) => {
                deletePromises.push(deleteDoc(doc(db, "ChatMessages", document.id)));
              });
              
              await Promise.all(deletePromises);
              
              // Después de eliminar los mensajes, añadir un nuevo mensaje de bienvenida
              const welcomeMessage = {
                id: Date.now().toString(),
                sender: 'bot',
                text: 'Hola, soy InnovaEdu. ¿En qué puedo ayudarte sobre normas de tránsito?',
                timestamp: new Date()
              };
              
              // Guardar el mensaje de bienvenida en Firestore
              await addDoc(collection(db, "ChatMessages"), {
                userId: user.uid,
                sender: welcomeMessage.sender,
                text: welcomeMessage.text,
                timestamp: welcomeMessage.timestamp
              });
              
              // Actualizar el estado con solo el mensaje de bienvenida
              setMessages([welcomeMessage]);
              setLoading(false);
            } catch (error) {
              console.error("Error al eliminar mensajes:", error);
              Alert.alert("Error", "No se pudieron eliminar los mensajes");
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Renderizar cada mensaje
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timeText}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>Cargando conversación...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="chatbubbles-outline" size={24} color="#D32F2F" />
          <Text style={styles.headerText}>Asistente Vial InnovaEdu</Text>
        </View>
        <TouchableOpacity onPress={deleteAllMessages} style={styles.trashButton}>
          <Ionicons name="trash-outline" size={22} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      {/* Conversación */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* Campo de texto con botones adicionales */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="attach-outline" size={22} color="#757575" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.micButton}>
          <Ionicons name="mic-outline" size={22} color="#757575" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          placeholder="Escribe tu consulta..."
          placeholderTextColor="#9E9E9E"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity 
          onPress={sendMessage} 
          style={[styles.sendButton, isSending && styles.sendingButton]}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    color: '#757575',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#D32F2F',
  },
  trashButton: {
    padding: 6,
  },
  chatContainer: {
    flexGrow: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#F28B82',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
  },
  messageText: {
    color: '#000',
    fontSize: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#616161',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  micButton: {
    padding: 8,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 80,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendingButton: {
    backgroundColor: '#E57373',
  },
});

export default ChatbotScreen;