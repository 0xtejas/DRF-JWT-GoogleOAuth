# pull official base image
FROM python:3.11.5

# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# set PATH for Poetry
ENV PATH="/root/.local/bin:$PATH"

# install Poetry using pip
RUN pip install poetry

# copy pyproject.toml and poetry.lock
COPY ./pyproject.toml ./poetry.lock ./

# install dependencies using Poetry
RUN poetry install --no-root

# copy django project
COPY . .

# copy entrypoint.sh
COPY ./entrypoint.sh /usr/src/app/entrypoint.sh

# make entrypoint.sh executable
RUN chmod +x /usr/src/app/entrypoint.sh

# run entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]