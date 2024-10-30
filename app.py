from flask import Flask, request, jsonify, render_template
from flask_cors import CORS  # Import CORS
import joblib
import numpy as np  # Import NumPy for type checking

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

# Load your model
model = joblib.load('crop_model.pkl')
print("Model loaded successfully.")

# Load the LabelEncoder
label_encoder = joblib.load('label_encoder.pkl')
print("LabelEncoder loaded successfully.")

# Load the scaler
scaler = joblib.load('scaler.pkl')
print("Scaler loaded successfully.")

# Home route to serve the HTML form
@app.route('/')
def home():
    return render_template('index.html')  # Assuming index.html is in the templates folder

# Prediction route
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    print(f"Received data: {data}")  # Log incoming data

    if data is None:
        print("No data received!")
        return jsonify({'error': 'No data received'}), 400

    required_fields = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall']
    for field in required_fields:
        if field not in data:
            print(f"Missing field: {field}")
            return jsonify({'error': f'Missing field: {field}'}), 400

    # Extract input values and convert to standard types
    nitrogen = int(data['nitrogen'])
    phosphorus = int(data['phosphorus'])
    potassium = int(data['potassium'])
    temperature = float(data['temperature'])
    humidity = float(data['humidity'])
    ph = float(data['ph'])
    rainfall = int(data['rainfall'])

    # Prepare input for prediction
    input_features = np.array([[nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]])

    # Scale the input features
    input_features_scaled = scaler.transform(input_features)

    # Make prediction using the loaded model
    prediction = model.predict(input_features_scaled)
    probability = model.predict_proba(input_features_scaled)

    # Inverse transform the prediction to get the crop name
    predicted_crop_label = label_encoder.inverse_transform(prediction)[0]

    # Convert numpy types to native Python types
    probability = probability.max() * 100  # Get max probability
    probability = float(probability)  # Convert to standard float

    print(f"Predicted crop: {predicted_crop_label}, Probability: {probability}")  # Log prediction

    return jsonify({'predicted_crop': predicted_crop_label, 'probability': probability})

if __name__ == '__main__':
    app.run(debug=True)
