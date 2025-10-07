import * as AuthSession from 'expo-auth-session';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ConfigHelper() {
  const [redirectUri, setRedirectUri] = useState('');

  useEffect(() => {
    try {
      const uri = AuthSession.makeRedirectUri({
        path: '/--/auth/callback',
      });
      setRedirectUri(uri);
    } catch (error) {
      console.error('Error generando URI:', error);
      setRedirectUri('radarpet://auth/callback');
    }
  }, []);

  const copyToClipboard = async (text: string) => {
    // Simular copia al clipboard para desarrollo
    Alert.alert('URL para copiar', text);
  };

  const siteUrl = redirectUri.split('/--/auth/callback')[0] || redirectUri.split('/auth/callback')[0];
  const redirectUrls = `${redirectUri},radarpet://auth/callback,http://localhost:8084/auth/callback`;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Configuración de URLs para Supabase</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Platform: {Platform.OS}</Text>
        
        <Text style={styles.sectionTitle}>Site URL:</Text>
        <View style={styles.urlContainer}>
          <Text style={styles.url}>{siteUrl}</Text>
          <Button title="Ver" onPress={() => copyToClipboard(siteUrl)} />
        </View>
        
        <Text style={styles.sectionTitle}>Redirect URI generada:</Text>
        <View style={styles.urlContainer}>
          <Text style={styles.url}>{redirectUri}</Text>
          <Button title="Ver" onPress={() => copyToClipboard(redirectUri)} />
        </View>
        
        <Text style={styles.sectionTitle}>Todas las Redirect URLs:</Text>
        <View style={styles.urlContainer}>
          <Text style={styles.url}>{redirectUrls}</Text>
          <Button title="Ver Todo" onPress={() => copyToClipboard(redirectUrls)} />
        </View>
        
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>📋 Instrucciones:</Text>
          <Text style={styles.instruction}>1. Copia la Site URL y pégala en Supabase Settings Authentication Site URL</Text>
          <Text style={styles.instruction}>2. Copia Todas las Redirect URLs y pégalas en Supabase Settings Authentication Redirect URLs</Text>
          <Text style={styles.instruction}>3. Guarda los cambios en Supabase</Text>
          <Text style={styles.instruction}>4. Prueba el login con Google</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  url: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  instructions: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
  },
  instruction: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
});
