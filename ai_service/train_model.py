import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import OneHotEncoder
import matplotlib.pyplot as plt
import seaborn as sns
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Download required NLTK data
nltk.download('stopwords')
nltk.download('wordnet')

# Initialize lemmatizer and stopwords
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def load_and_preprocess_data(file_path):
    """
    Load and preprocess the CSV data
    """
    # Load the data
    df = pd.read_csv(file_path)
    
    # Display basic info
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"Verified status distribution:\n{df['verified_status'].value_counts()}")
    
    # Drop unnecessary columns if they exist
    columns_to_keep = ['title', 'description', 'category', 'goalAmount', 'verified_status']
    df = df[[col for col in columns_to_keep if col in df.columns]]
    
    # Handle missing values
    df = df.dropna()
    
    # Convert goalAmount to numeric if it's not already
    df['goalAmount'] = pd.to_numeric(df['goalAmount'], errors='coerce')
    df = df.dropna(subset=['goalAmount'])
    
    # Convert verified_status to binary (1 for approved, 0 for rejected)
    # Handle different possible representations of the status
    df['verified_status'] = df['verified_status'].apply(
        lambda x: 1 if str(x).lower() in ['approved', '1', 'true', 'yes', 'approve'] else 0
    )
    
    return df

def preprocess_text(text):
    """
    Preprocess text data: clean, tokenize, remove stopwords, and lemmatize
    """
    if pd.isna(text):
        return ""
    
    # Convert to lowercase
    text = str(text).lower()
    
    # Remove special characters and digits
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Tokenize
    words = text.split()
    
    # Remove stopwords and lemmatize
    words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    
    return ' '.join(words)

def create_features(df):
    """
    Create features for the model
    """
    # Preprocess text fields
    df['title_processed'] = df['title'].apply(preprocess_text)
    df['description_processed'] = df['description'].apply(preprocess_text)
    
    # Create combined text feature
    df['combined_text'] = df['title_processed'] + ' ' + df['description_processed']
    
    # Create additional features
    df['title_length'] = df['title'].apply(lambda x: len(str(x)))
    df['description_length'] = df['description'].apply(lambda x: len(str(x)))
    df['goalAmount_log'] = np.log1p(df['goalAmount'])
    
    return df

def train_model(df):
    """
    Train the classification model
    """
    # Split the data
    X = df[['combined_text', 'category', 'goalAmount_log', 'title_length', 'description_length']]
    y = df['verified_status']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Create preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('text', TfidfVectorizer(max_features=5000, ngram_range=(1, 2)), 'combined_text'),
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['category']),
            ('num', 'passthrough', ['goalAmount_log', 'title_length', 'description_length'])
        ]
    )
    
    # Create the model pipeline
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=100, 
            random_state=42,
            class_weight='balanced'  # Handle class imbalance
        ))
    ])
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Evaluate the model
    print("Model Evaluation:")
    print(classification_report(y_test, y_pred))
    
    # Plot confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.show()
    
    return model, X_test, y_test, y_pred

def analyze_feature_importance(model, X):
    """
    Analyze feature importance for the model
    """
    # Get feature names
    feature_names = []
    
    # Text features from TF-IDF
    text_features = model.named_steps['preprocessor'].named_transformers_['text'].get_feature_names_out()
    feature_names.extend(text_features)
    
    # Categorical features
    cat_encoder = model.named_steps['preprocessor'].named_transformers_['cat']
    cat_features = cat_encoder.get_feature_names_out(['category'])
    feature_names.extend(cat_features)
    
    # Numerical features
    num_features = ['goalAmount_log', 'title_length', 'description_length']
    feature_names.extend(num_features)
    
    # Get feature importances
    importances = model.named_steps['classifier'].feature_importances_
    
    # Create a DataFrame for feature importance
    feature_importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': importances
    })
    
    # Sort by importance
    feature_importance_df = feature_importance_df.sort_values('importance', ascending=False)
    
    # Display top 20 features
    plt.figure(figsize=(10, 8))
    sns.barplot(x='importance', y='feature', data=feature_importance_df.head(20))
    plt.title('Top 20 Feature Importances')
    plt.tight_layout()
    plt.show()
    
    return feature_importance_df

def main():
    """
    Main function to run the entire training pipeline
    """
    # Load and preprocess the data
    file_path = 'communityfund_projects.csv'  # Update with your CSV path
    df = load_and_preprocess_data(file_path)
    
    # Create features
    df = create_features(df)
    
    # Train the model
    model, X_test, y_test, y_pred = train_model(df)
    
    # Analyze feature importance
    feature_importance_df = analyze_feature_importance(model, X_test)
    
    # Save the model
    import joblib
    joblib.dump(model, 'project_verification_model.pkl')
    print("Model saved as 'project_verification_model.pkl'")
    
    return model

if __name__ == "__main__":
    model = main()