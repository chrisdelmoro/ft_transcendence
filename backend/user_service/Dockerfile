FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TZ=America/Sao_Paulo

# Set work directory
WORKDIR /usr/src/app

# Install dependencies
COPY requirements.txt /usr/src/app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y \
    gcc \
    libffi-dev \
    ntp

# Install tzdata package to enable timezone setting
RUN apt-get update && \
apt-get install -y tzdata && \
ln -fs /usr/share/zoneinfo/$TZ /etc/localtime && \
dpkg-reconfigure --frontend noninteractive tzdata

# Copy project
COPY . /usr/src/app/
EXPOSE 8000
CMD python3 manage.py makemigrations && python3 manage.py migrate && service start ntp

ENTRYPOINT python3 manage.py makemigrations && python3 manage.py migrate && sleep 5 && python3 manage.py runserver 0.0.0.0:8000
