// Importe l'outil qui permet de simuler des requêtes HTTP.
const request = require('supertest');

// Importe l'application Express.
const app = require('../app');

// Vérifie que la route renvoie la liste des tâches.
test('GET /todos renvoie la liste des tâches', async function () {
    // Envoie une requête GET à l'application.
    const reponse = await request(app).get('/todos');

    // Vérifie que la requête a réussi.
    expect(reponse.status).toBe(200);

    // Vérifie que la liste contient la première tâche attendue.
    expect(reponse.body[0].todolist).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                id: 1,
                text: 'Learn about Polymer'
            })
        ])
    );
});

// Vérifie la réponse lorsqu'une tâche n'existe pas.
test('GET /todos/999 renvoie une erreur 404', async function () {
    // Demande une tâche dont l'identifiant n'existe pas.
    const reponse = await request(app).get('/todos/999');

    // Vérifie que le serveur indique que la tâche est introuvable.
    expect(reponse.status).toBe(404);

    // Vérifie le message renvoyé.
    expect(reponse.text).toBe('Todo not found');
});

// Vérifie que l'on peut créer une nouvelle tâche.
test('POST /todos ajoute une tâche', async function () {
    // Envoie les informations de la tâche au backend.
    const reponse = await request(app)
        .post('/todos')
        .send({
            text: 'Réviser les tests',
            Tags: ['Formation'],
            is_complete: false
        });

    // Vérifie que le serveur confirme la création.
    expect(reponse.status).toBe(201);

    // Vérifie les informations de la tâche créée.
    expect(reponse.body).toEqual(expect.objectContaining({
        id: expect.any(Number),
        text: 'Réviser les tests',
        Tags: ['Formation'],
        is_complete: false
    }));

    // Vérifie que la tâche est accessible après sa création.
    const verification = await request(app)
        .get(`/todos/${reponse.body.id}`);

    expect(verification.status).toBe(200);
    expect(verification.body).toEqual(reponse.body);
});

// Vérifie que l'on peut modifier une tâche existante.
test('PUT /todos/:id modifie une tâche', async function () {
    // Crée une tâche pour ce test.
    const creation = await request(app)
        .post('/todos')
        .send({
            text: 'Tâche à modifier',
            Tags: ['Formation'],
            is_complete: false
        });

    const id = creation.body.id;

    // Modifie son texte et la marque comme terminée.
    const reponse = await request(app)
        .put(`/todos/${id}`)
        .send({
            text: 'Tâche modifiée',
            is_complete: true
        });

    // Vérifie que la modification a réussi.
    expect(reponse.status).toBe(200);

    // Vérifie les valeurs modifiées et les informations conservées.
    expect(reponse.body).toEqual(expect.objectContaining({
        id: id,
        text: 'Tâche modifiée',
        Tags: ['Formation'],
        is_complete: true
    }));

    // Vérifie que la modification est enregistrée.
    const verification = await request(app).get(`/todos/${id}`);

    expect(verification.status).toBe(200);
    expect(verification.body).toEqual(reponse.body);
});

// Vérifie que l'on peut supprimer une tâche.
test('DELETE /todos/:id supprime une tâche', async function () {
    // Crée une tâche à supprimer pour ce test.
    const creation = await request(app)
        .post('/todos')
        .send({
            text: 'Tâche à supprimer',
            Tags: ['Formation'],
            is_complete: false
        });

    expect(creation.status).toBe(201);
    const id = creation.body.id;

    // Demande la suppression de cette tâche.
    const reponse = await request(app).delete(`/todos/${id}`);

    // Vérifie que le serveur confirme la suppression.
    expect(reponse.status).toBe(200);
    expect(reponse.text).toBe('Todo deleted successfully');

    // Vérifie que la tâche n'est plus accessible.
    const verification = await request(app).get(`/todos/${id}`);

    expect(verification.status).toBe(404);
    expect(verification.text).toBe('Todo not found');
});

// Vérifie la modification d'une tâche inexistante.
test('PUT /todos/999 renvoie une erreur 404', async function () {
    const reponse = await request(app)
        .put('/todos/999')
        .send({ text: 'Tâche inexistante' });

    expect(reponse.status).toBe(404);
    expect(reponse.text).toBe('Todo not found');
});

// Vérifie la suppression d'une tâche inexistante.
test('DELETE /todos/999 renvoie une erreur 404', async function () {
    const reponse = await request(app).delete('/todos/999');

    expect(reponse.status).toBe(404);
    expect(reponse.text).toBe('Todo not found');
});