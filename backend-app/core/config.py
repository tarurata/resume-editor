from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    # API settings
    api_v1_prefix: str = "/api/v1"
    
    # Database settings
    database_url: Optional[str] = None
    
    # /LLM settings (matching frontend LLM config)
    llm_api_key: Optional[str] = None
    llm_provider: str = "openai"
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"
    llm_timeout: int = 30000
    llm_max_retries: int = 3
    llm_retry_delay: int = 1000
    llm_max_tokens: int = 4000
    
    # AI rate limiting
    ai_max_requests_per_minute: int = 60
    ai_max_tokens_per_minute: int = 150000

    # JWT settings
    jwt_secret_key: str = "a_very_secret_key"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    class Config:
        env_file = "/.env.local"
        env_file_encoding = "utf-8"
        case_sensitive = False


def get_settings() -> Settings:
    """Get application settings."""
    return Settings()


settings = Settings()
