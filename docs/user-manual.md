# Manuel Utilisateur - Plateforme SaaS MVP

## Vue d'ensemble
Ce manuel guide les utilisateurs dans l'utilisation de la plateforme SaaS MVP, couvrant la gestion des rôles, les campagnes marketing et la configuration des fonctionnalités par plan.

## Architecture des Rôles

### Rôles Organisationnels Français

#### 1. CUSTOMER_ADMIN (Administrateur Client)
**Profil**: CTO, Directeur Technique, Architecte Senior
**Responsabilités**:
- Configuration technique complète de l'application
- Gestion des plans et fonctionnalités
- Administration des campagnes marketing
- Gestion complète de l'équipe

**Accès**:
- ✅ Configuration technique (ADMIN)
- ✅ Dashboard marketing (ADMIN) 
- ✅ Configuration des plans (ADMIN)
- ✅ Documentation API (ADMIN)

#### 2. CUSTOMER_MANAGER (Manager Client)
**Profil**: Product Manager, Chef de projet technique
**Responsabilités**:
- Gestion des campagnes marketing
- Consultation des plans et fonctionnalités
- Analyse des métriques et performances
- Coordination de l'équipe projet

**Accès**:
- ❌ Configuration technique
- ✅ Dashboard marketing (ADMIN)
- ✅ Configuration des plans (READ)
- ✅ Documentation API (READ)

#### 3. CUSTOMER_DEVELOPER (Développeur Client)
**Profil**: Développeur Senior, Ingénieur Full-Stack  
**Responsabilités**:
- Consultation de la documentation API
- Intégration technique des fonctionnalités
- Tests et validation des implémentations

**Accès**:
- ❌ Configuration technique
- ❌ Dashboard marketing
- ❌ Configuration des plans
- ✅ Documentation API (READ)

## Guide d'utilisation

### 1. Gestion des Rôles et de l'Équipe

#### Accéder à la gestion des rôles
1. Connectez-vous à la plateforme
2. Cliquez sur **"Gestion des Rôles"** dans le menu principal
3. La page d'architecture des rôles s'affiche

#### Ajouter un membre d'équipe
1. Cliquez sur **"Ajouter un membre"**
2. Saisissez l'email du collaborateur
3. Sélectionnez le rôle approprié selon le profil:
   - **CUSTOMER_ADMIN** pour les CTOs/Directeurs Techniques
   - **CUSTOMER_MANAGER** pour les Product Managers
   - **CUSTOMER_DEVELOPER** pour les Développeurs
4. Cliquez sur **"Confirmer l'ajout"**
5. Un email d'invitation est envoyé automatiquement

#### Modifier les permissions d'un membre
1. Recherchez le membre dans la liste de l'équipe
2. Cliquez sur **"Modifier"** à côté de son nom
3. Changez le rôle si nécessaire
4. Confirmez la modification
5. Les nouvelles permissions sont appliquées immédiatement

#### Visualiser les permissions
- Les **badges de rôle** indiquent le niveau d'accès de chaque membre
- Les **cartes de permission** détaillent les accès spécifiques
- Un **graphique d'architecture** montre la hiérarchie organisationnelle

### 2. Dashboard Marketing

#### Accéder au marketing (CUSTOMER_ADMIN et CUSTOMER_MANAGER uniquement)
1. Cliquez sur **"Marketing"** dans le menu principal
2. Le dashboard marketing s'ouvre avec les métriques principales

#### Créer une campagne A/B Test
1. Cliquez sur **"Créer une campagne"**
2. Remplissez le formulaire:
   - **Nom de campagne**: Ex: "Test Prix Premium A/B"
   - **Type**: Sélectionnez "A/B Test"
   - **Description**: Décrivez l'objectif du test
3. Configurez les variantes:
   - **Variante A**: Ex: "€29/mois"
   - **Variante B**: Ex: "€39/mois"  
   - **Répartition du trafic**: 50/50 par défaut
4. Cliquez sur **"Sauvegarder la campagne"**

#### Créer une Landing Page
1. **"Créer une campagne"** > Type: "Landing Page"
2. Configurez le contenu:
   - **Audience cible**: Sélectionnez le segment (utilisateurs plan basique, premium, etc.)
   - **Objectif de conversion**: Upgrade de plan, adoption de fonctionnalité
   - **Design**: Choisissez un template ou personnalisez
3. Définissez les métriques de succès
4. Planifiez la publication

#### Analyser les performances des campagnes
1. Cliquez sur **"Analytiques"** dans le menu marketing
2. Consultez les métriques principales:
   - **Vues totales et uniques**
   - **Taux de conversion**
   - **Revenus générés**
   - **ROI de la campagne**
3. Utilisez les filtres par date, type de campagne, ou audience
4. Exportez les rapports en CSV/PDF si nécessaire

### 3. Gestion des Plans et Fonctionnalités

#### Accéder à la configuration des plans (CUSTOMER_ADMIN uniquement)
1. Cliquez sur **"Plans"** dans le menu principal
2. Vue d'ensemble des plans existants

#### Créer un nouveau plan
1. Cliquez sur **"Créer un plan"**
2. Renseignez les informations:
   - **Nom du plan**: Ex: "Premium Enterprise"
   - **Description**: Fonctionnalités incluses
   - **Prix**: Montant en euros
   - **Devise**: EUR par défaut
3. Sauvegardez le plan de base

#### Configurer les fonctionnalités du plan
1. Ouvrez le plan créé
2. Cliquez sur l'onglet **"Fonctionnalités"**
3. Ajoutez des fonctionnalités:

**Accès API**:
- Type: "API_ACCESS"
- Limite de requêtes: 10 000/mois
- Limite de débit: 1 000/minute
- Statut: Activé

**Analytics Avancées**:
- Type: "ADVANCED_ANALYTICS"
- Rétention des données: 365 jours
- Rapports personnalisés: Activé
- Statut: Activé

**Intégrations Externes**:
- Type: "EXTERNAL_INTEGRATIONS" 
- Nombre d'intégrations: 10
- Webhooks: Activé
- Statut: Activé

4. Configurez les limites selon le niveau du plan
5. Sauvegardez la configuration

#### Visualiser l'utilisation des fonctionnalités (Lecture seule pour CUSTOMER_MANAGER)
1. Accédez à **"Plans"** > **"Analytics d'utilisation"**
2. Consultez les métriques par fonctionnalité:
   - Utilisation API en temps réel
   - Statistiques d'adoption des fonctionnalités
   - Tendances d'usage par plan
3. Identifiez les opportunités d'optimisation

### 4. Documentation API (Tous les rôles)

#### Accéder à la documentation
1. Cliquez sur **"Documentation API"** dans le menu
2. Navigation par sections:
   - **Authentification**: Guide JWT et tokens
   - **Gestion des rôles**: Endpoints de permissions
   - **Campagnes marketing**: API de création et gestion
   - **Plans et fonctionnalités**: Configuration et limites

#### Tester les APIs (CUSTOMER_DEVELOPER)
1. Utilisez l'interface interactive Swagger
2. Authentifiez-vous avec votre token JWT
3. Testez les endpoints selon vos permissions:
   - Récupération des rôles utilisateur
   - Consultation des plans disponibles
   - Accès aux métriques autorisées

## Workflows Recommandés

### Workflow 1: Onboarding d'organisation complète
1. **CTO Sophie** (CUSTOMER_ADMIN):
   - Se connecte et configure l'application
   - Ajoute **Marc** comme CUSTOMER_MANAGER  
   - Ajoute **Julien** comme CUSTOMER_DEVELOPER
   - Configure les plans premium pour l'entreprise

2. **Product Manager Marc** (CUSTOMER_MANAGER):
   - Accède au dashboard marketing
   - Crée des campagnes A/B pour tester les prix
   - Analyse les performances et optimise

3. **Développeur Julien** (CUSTOMER_DEVELOPER):
   - Consulte la documentation API
   - Intègre les fonctionnalités dans l'application cliente
   - Teste les limites et permissions

### Workflow 2: Campagne marketing ciblée par plan
1. **Identification de l'opportunité**:
   - Analyser les métriques d'usage des plans basiques
   - Identifier les utilisateurs proches des limites

2. **Création de la campagne**:
   - Cibler les utilisateurs du plan basique
   - Créer un A/B test "Upgrade Premium"
   - Mettre en avant les fonctionnalités avancées

3. **Optimisation continue**:
   - Surveiller les taux de conversion
   - Ajuster les messages selon les résultats
   - Analyser le ROI et étendre aux autres segments

### Workflow 3: Configuration technique avancée
1. **Audit des besoins**:
   - Évaluer les demandes clients
   - Analyser l'utilisation actuelle des fonctionnalités

2. **Configuration des nouvelles fonctionnalités**:
   - Créer des plans personnalisés si nécessaire
   - Définir des limites appropriées
   - Tester l'impact sur les performances

3. **Déploiement et monitoring**:
   - Activer progressivement les nouvelles fonctionnalités
   - Surveiller les métriques de performance
   - Ajuster selon les retours utilisateurs

## Bonnes Pratiques

### Gestion des Rôles
- ✅ Assignez les rôles selon les profils métier réels
- ✅ Révisez régulièrement les permissions d'accès
- ✅ Utilisez le principe de moindre privilège
- ❌ N'accordez pas d'accès ADMIN sans justification

### Marketing
- ✅ Testez toujours plusieurs variantes (A/B testing)
- ✅ Définissez des objectifs mesurables avant chaque campagne
- ✅ Analysez les données avant d'optimiser
- ❌ Ne lancez pas de campagnes sans ciblage précis

### Configuration Technique
- ✅ Documentez toutes les modifications de configuration
- ✅ Testez les limites avant de les appliquer en production
- ✅ Surveillez l'impact des changements sur les performances
- ❌ Ne modifiez pas les limites critiques sans backup

### Sécurité
- ✅ Changez régulièrement les mots de passe
- ✅ Vérifiez les logs d'accès suspectes
- ✅ Formez l'équipe aux bonnes pratiques de sécurité
- ❌ Ne partagez jamais les identifiants d'accès

## Support et Dépannage

### FAQ Communes

**Q: Pourquoi ne puis-je pas accéder au dashboard marketing ?**
R: Vérifiez que vous avez le rôle CUSTOMER_ADMIN ou CUSTOMER_MANAGER. Les CUSTOMER_DEVELOPER n'ont pas accès aux fonctionnalités marketing.

**Q: Comment modifier les limites d'API d'un plan existant ?**
R: Seuls les CUSTOMER_ADMIN peuvent modifier les configurations de plan. Accédez à Plans > [Nom du plan] > Fonctionnalités.

**Q: Les métriques de campagne ne s'affichent pas correctement**
R: Vérifiez que la campagne est bien activée et que les événements de tracking sont correctement configurés.

**Q: Comment inviter de nouveaux membres avec des rôles spécifiques ?**
R: Utilisez la fonction "Ajouter un membre" dans la gestion des rôles. Sélectionnez le rôle approprié selon le profil métier.

### Contact Support
- **Email technique**: support-technique@saasplatform.com
- **Documentation complète**: https://docs.saasplatform.com
- **Assistance urgente**: Utilisez le chat intégré dans l'application

### Mises à jour et Nouveautés
Les nouvelles fonctionnalités et améliorations sont déployées régulièrement. Consultez les notes de version dans **"Paramètres"** > **"Mises à jour"** pour rester informé des dernières évolutions.