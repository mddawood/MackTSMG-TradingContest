from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Delta Trading Competition"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Database
    DATABASE_URL: str = "sqlite:///./delta_competition.db"

    # Delta Exchange
    DELTA_TESTNET_URL: str = "https://testnet-api.delta.exchange"
    DELTA_MAINNET_URL: str = "https://api.delta.exchange"
    DELTA_TESTNET_INDIA_URL: str = "https://cdn-ind.testnet.deltaex.org"
    DELTA_MAINNET_INDIA_URL: str = "https://api.india.delta.exchange"

    # Encryption
    ENCRYPTION_KEY: str

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create a single instance that all parts of your app will use
settings = Settings()
