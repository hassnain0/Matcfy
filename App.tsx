import {View, Alert, StyleSheet, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
import {
  PlatformPay,
  StripeProvider,
  usePlatformPay,
  createPlatformPayPaymentMethod,
} from '@stripe/stripe-react-native';
import axios from 'axios';
import React, {useRef, useState} from 'react';

const App = () => {
  //Ref
  const webViewRef = useRef(null);

  const [paymentCompleted, setPayementCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {isPlatformPaySupported, confirmPlatformPayPayment} = usePlatformPay();
  React.useEffect(() => {
    (async function () {
      if (!(await isPlatformPaySupported({googlePay: {testEnv: true}}))) {
        console.log('Google Pay is not supported.');
        setLoading(false);
        return;
      }
    })();
  }, []);
  const createPaymentMethod = async () => {
    const {error, paymentMethod} = await createPlatformPayPaymentMethod({
      applePay: {
        cartItems: [
          {
            label: 'Example item name',
            amount: '14.00',
            paymentType: PlatformPay.PaymentType.Immediate,
          },
          {
            label: 'Total',
            amount: '12.75',
            paymentType: PlatformPay.PaymentType.Immediate,
          },
        ],
        merchantCountryCode: 'US',
        currencyCode: 'USD',
      },
    });

    if (error) {
      Alert.alert(error.code, error.message);
      return;
    } else if (paymentMethod) {
      setLoading(false);
    }
  };

  const fetchPaymentIntentClientSecret = async () => {
    const apiUrl =
      'https://amplepoints.com/apiendpoint/createpaymentintend?user_id=126&total_amount=118.00&order_id=AMPLI9Zd27&customer_name=Hiren Buhecha';

    const response = await axios.get(apiUrl);

    if (response && response.data && response.data.data.clientSecret) {
      return response.data.data.clientSecret;
    }
  };

  const payApple = async () => {
    const clientSecret = await fetchPaymentIntentClientSecret();
    const {error} = await confirmPlatformPayPayment(clientSecret, {
      applePay: {
        cartItems: [
          {
            label: 'Example item name',
            amount: '14.00',
            paymentType: PlatformPay.PaymentType.Immediate,
          },
          {
            label: 'Total',
            amount: '12.75',
            paymentType: PlatformPay.PaymentType.Immediate,
          },
        ],
        merchantCountryCode: 'US',
        currencyCode: 'USD',
        requiredShippingAddressFields: [PlatformPay.ContactField.PostalAddress],
        requiredBillingContactFields: [PlatformPay.ContactField.PhoneNumber],
      },
    });
    if (error) {
      Alert.alert(error.code, error.message);
    } else {
      setLoading(false);
    }
  };

  const pay = async () => {
    setLoading(false);
    const clientSecret = await fetchPaymentIntentClientSecret();

    const {error} = await confirmPlatformPayPayment(clientSecret, {
      googlePay: {
        testEnv: true,
        merchantName: 'Hassnian Ali',
        merchantCountryCode: 'US',
        currencyCode: 'USD',
        billingAddressConfig: {
          format: PlatformPay.BillingAddressFormat.Full,
          isPhoneNumberRequired: true,
          isRequired: true,
        },
      },
    });

    if (error?.code == 'Canceled') {
      if (webViewRef.current) {
        try {
          webViewRef.current.injectJavaScript(
            `window.location.href = "https://matchfy.net/mo/upgradeGrade";`,
          );
        } catch (error) {
          console.log('Error', error);
        }
      }
      return;
    }

    setLoading(false);
    return;
  };

  const onMessage = event => {
    const message = event.nativeEvent.data;
    console.log('Called');
    if (message === 'Button Pressed') {
      setLoading(true);
      pay();
    }
  };

  //Method that handles navigation
  const injectedJavaScript = `
  (function() {
    var radio = document.getElementById('grade02');
    var buttons = document.querySelectorAll('.btn.type01');
    radio.addEventListener('change', function() {
      if (this.checked) {
        buttons.forEach(function(button) {
          button.addEventListener('click', function() {
            window.ReactNativeWebView.postMessage('Button Pressed');
          });
        });
      }
    });
  })();

`;
  return (
    <StripeProvider publishableKey="pk_test_51 NpOZ4GY4n5u6WbIlWOsccAKTTMLq7xnjfG8fFboidp6jZCx2XlssuBHyNbvBsqfGDkbVkZH2Knka498eIzAjdPZ00YZBjdzik">
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{uri: 'https://matchfy.net/'}}
          onMessage={onMessage}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          injectedJavaScript={injectedJavaScript}
        />
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#F10261" />
          </View>
        )}
      </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default App;
