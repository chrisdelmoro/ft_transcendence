FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /usr/src/app

# Install dependencies
COPY requirements.txt /usr/src/app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project
COPY . /usr/src/app/

EXPOSE 8000
CMD python3 manage.py makemigrations && python3 manage.py migrate

ENTRYPOINT sleep 10 && python3 manage.py runserver 0.0.0.0:8000
