from datetime import datetime, time
from typing_extensions import Annotated
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Mapped, mapped_column, Session
from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String, Boolean, Text, create_engine, select, DateTime
import os
from dotenv import load_dotenv

load_dotenv()


Base = declarative_base()

int_pk = Annotated[int, mapped_column(Integer, primary_key=True)]
str_250 = Annotated[str, mapped_column(String(length=250))]
str_150 = Annotated[str, mapped_column(String(length=150))]
dt = Annotated[datetime, mapped_column(TIMESTAMP)]
txt = Annotated[str, mapped_column(Text)]
#int = Annotated[int, mapped_column(Integer)]

class ModelData(Base):
    __tablename__ = "model"
    id: Mapped[int_pk]    
    model_id: Mapped[Annotated[str, mapped_column(String(length=100))]] # Column(String, primary_key=True)
    name: Mapped[Annotated[str, mapped_column(String(length=200))]] # Column(String)
    description: Mapped[Annotated[str, mapped_column(Text)]] #Column(String)
    icon_url: Mapped[Annotated[str, mapped_column(String(length=50))]] #
    available: Mapped[Annotated[bool, mapped_column(Boolean)]] #Column(Boolean)
    trigger_word: Mapped[Annotated[str, mapped_column(String(length=50))]] # Column(String)
    tags: Mapped[Annotated[str, mapped_column(String(length=1024))]] # Column(String)
    negative_available: Mapped[Annotated[bool, mapped_column(Boolean)]] # = Column(Boolean)
    model_url: Mapped[Annotated[str, mapped_column(String(length=256))]] # = Column(String)
    resize_available: Mapped[Annotated[bool, mapped_column(Boolean)]] # Column(Boolean)
    steps_available: Mapped[Annotated[bool, mapped_column(Boolean)]] # Column(Boolean)
    guidance_available: Mapped[Annotated[bool, mapped_column(Boolean)]] # Column(Boolean)
    users: Mapped[list["UserProfile"]] = relationship(
        "UserProfile",
        back_populates="model",
        cascade="all, delete",
    )    


class UserProfile(Base):
    __tablename__ = "user_profile"

    id: Mapped[int_pk] #Column(Integer, primary_key=True)
    user_name: Mapped[str_250]
    token_count: Mapped[int]
    preferences: Mapped["UserPreferences"] = relationship(
        "UserPreferences",
        back_populates="user",
        cascade="all, delete",
    )
    images: Mapped[list["UserImage"]] = relationship(
        "UserImage",
        back_populates="user",
        cascade="all, delete",
    )
    selected_model_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("model.id"),
    )
    model: Mapped["ModelData"] = relationship(
        "ModelData",
        back_populates="users"
    )

class UserPreferences(Base):
    __tablename__ = "user_prefs"

    id: Mapped[int_pk]
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("user_profile.id"),
    )
    user: Mapped["UserProfile"] = relationship(
        back_populates="preferences"
    )

class JobHistory(Base):
    __tablename__ = "job_history"
    id: Mapped[int_pk]
    job_reference_id: Mapped[str_150]
    timestamp: Mapped[dt]
    images: Mapped[list["UserImage"]] = relationship(
        "UserImage",
        back_populates="job",
        cascade="all, delete",
    )

class UserImage(Base):
    __tablename__ = "user_image"
    id: Mapped[int_pk]
    job_id: Mapped[int] =  mapped_column(
        Integer,
        ForeignKey("job_history.id")
    )
    job: Mapped["JobHistory"] = relationship(
        "JobHistory",
        back_populates="images"
    )
    index: Mapped[int]
    image_data: Mapped[txt]
    user_id: Mapped[int] =  mapped_column(
        Integer,
        ForeignKey("user_profile.id")
    )
    user: Mapped["UserProfile"] = relationship(
        "UserProfile",
        back_populates="images"
    )


engine = create_engine(os.getenv('DATABASE_URL'), echo=True)

with Session(bind=engine) as session:
    record = session.query(UserProfile).filter(UserProfile.user_name == "google-oauth2|108945084974066666376").first()

    print(record.id)
    print(len(record.images))

    print(record.model.model_id)

    models = session.query(ModelData).all()

   # for m in models:
   #     print(m.name)

    # new_job = JobHistory(job_reference_id="job_ref_1", timestamp=datetime.now())
    # new_image = UserImage(job=new_job, user=record, image_data="image_data1", index=0)
    # new_image2 = UserImage(job=new_job, user=record, image_data="image_data2", index=1)

    # session.add(new_job)
    # session.add(new_image)
    # session.add(new_image2)

    # session.commit()


    # record = session.query(UserImage).filter(UserImage.user.has(UserProfile.user_name == "google-oauth2|108945084974066666376")).first()
    # print(record.image_data)
    # print(record.user.user_name)

    # records = session.query(JobHistory).all()
    # for r in records:
    #     print(r.job_reference_id)

    #     for i in r.images:
    #       print(i.image_data)
    #       print(i.job.job_reference_id)