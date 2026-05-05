import { Image, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>KAICLO</Text>
      <Text style={styles.subtitle}>FOOD</Text>
      <Text style={styles.slogan}>Pide. Sonríe.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EBDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5A4634',
  },
  subtitle: {
    fontSize: 18,
    color: '#5A4634',
  },
  slogan: {
    marginTop: 10,
    color: '#888',
  },
});