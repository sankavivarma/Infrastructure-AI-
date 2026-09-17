import os
import sys
import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database.session import Base
from app.models.db_models import Project, User, ProjectRiskPrediction
from app.services.ingestion_service import calculate_project_risk, seed_default_users

class TestInfraPredictBackend(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite:///:memory:')
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

    def tearDown(self):
        self.db.close()

    def test_seed_default_users(self):
        seed_default_users(self.db)
        user_count = self.db.query(User).count()
        self.assertEqual(user_count, 5)

    def test_risk_calculation_engine(self):
        # Case 1: High Cost Overrun
        risk_high = calculate_project_risk(planned_cost=500.0, current_cost=800.0, expenditure=600.0, actual_progress=30.0)
        self.assertEqual(risk_high['overall_risk_category'], 'HIGH')
        self.assertGreaterEqual(risk_high['overall_risk_score'], 67.0)

        # Case 2: On Track Project
        risk_low = calculate_project_risk(planned_cost=1000.0, current_cost=1000.0, expenditure=800.0, actual_progress=80.0)
        self.assertIn(risk_low['overall_risk_category'], ['MEDIUM', 'LOW'])

if __name__ == '__main__':
    unittest.main()
