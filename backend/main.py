from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier, BaggingClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, mean_squared_error
from sklearn.neural_network import MLPClassifier
import pickle
import os

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load Data
def load_data(file_path):
    if file_path.endswith('.csv'):
        return pd.read_csv(file_path)
    elif file_path.endswith(('.xls', '.xlsx')):
        return pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format")

# Preprocess Data
def preprocess_data(df):
    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]
    return X, y

# Create a preprocessing pipeline
def create_preprocessing_pipeline(X):
    # Identify categorical columns
    categorical_features = X.select_dtypes(include=['object']).columns.tolist()
    numeric_features = X.select_dtypes(include=['number']).columns.tolist()

    # Create transformers for numeric and categorical features
    numeric_transformer = 'passthrough'
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    # Create a column transformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    return preprocessor

# Train Model
def train_model(X_train, y_train, model, preprocessor):
    pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                               ('classifier', model)])
    pipeline.fit(X_train, y_train)
    return pipeline

# Evaluate Model
def evaluate_model(X_test, y_test, pipeline):
    y_pred = pipeline.predict(X_test)
    try:
        accuracy = accuracy_score(y_test, y_pred)
        rmse = mean_squared_error(y_test, y_pred, squared=False)
        return {'accuracy': accuracy, 'rmse': rmse}
    except ValueError:
        # If classification, only calculate accuracy
        accuracy = accuracy_score(y_test, y_pred)
        return {'accuracy': accuracy}

# Upload and Ingest Data
@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    df = load_data(file_path)
    X, y = preprocess_data(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = create_preprocessing_pipeline(X_train)

    models = {
        'SVM': SVC(),
        'Decision Tree': DecisionTreeClassifier(),
        'Random Forest': RandomForestClassifier(),
        'AdaBoost': AdaBoostClassifier(),
        'Bagging': BaggingClassifier(),
        'XGBoost': XGBClassifier(),
        'Neural Network': MLPClassifier(max_iter=1000)
    }

    results = {}

    for name, model in models.items():
        trained_pipeline = train_model(X_train, y_train, model, preprocessor)
        evaluation = evaluate_model(X_test, y_test, trained_pipeline)
        model_path = os.path.join(UPLOAD_FOLDER, f'{name}_model.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump(trained_pipeline, f)
        
        results[name] = {
            'evaluation': evaluation,
            'model_path': model_path
        }

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
