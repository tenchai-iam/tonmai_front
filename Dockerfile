FROM python:3.12

WORKDIR /

COPY /app /app
COPY /data /data
COPY /conf /conf
COPY /notebooks /notebooks
COPY /shared /shared
COPY requirements.txt .

RUN apt update -y  &&  apt upgrade -y && apt-get update 
RUN apt install -y curl git unixodbc-dev

# Add SQL Server ODBC Driver 17 for Ubuntu 18.04
RUN curl https://packages.microsoft.com/keys/microsoft.asc | tee /etc/apt/trusted.gpg.d/microsoft.asc
RUN curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list
RUN apt-get update
RUN ACCEPT_EULA=Y apt-get install msodbcsql17 -y
RUN ACCEPT_EULA=Y apt-get install mssql-tools -y
RUN echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bash_profile
RUN echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc

RUN pip install -r requirements.txt

EXPOSE 8060

CMD ["python", "/app/main.py"]