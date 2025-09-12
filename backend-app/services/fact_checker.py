import re
from typing import List, Set, Dict, Optional
from difflib import SequenceMatcher
from app.models.resume import FactsInventory, RiskFlags, Resume, DateRange


class FactChecker:
    """Service for checking edit suggestions against resume facts inventory"""
    
    def __init__(self, similarity_threshold: float = 0.8):
        self.similarity_threshold = similarity_threshold
    
    def build_facts_inventory(self, resume: Resume) -> FactsInventory:
        """Build facts inventory from resume data"""
        # Extract skills
        skills = set(resume.skills)
        
        # Extract organizations from experience
        organizations = set()
        for exp in resume.experience:
            organizations.add(exp.organization)
        
        # Extract roles from experience
        roles = set()
        for exp in resume.experience:
            roles.add(exp.role)
        
        # Extract dates from experience as DateRange objects
        dates = []
        for exp in resume.experience:
            dates.append(DateRange(start=exp.startDate, end=exp.endDate))
        
        # Extract certifications (if any in the future)
        certifications = []
        
        return FactsInventory(
            skills=list(skills),
            organizations=list(organizations),
            roles=list(roles),
            dates=dates,
            certifications=certifications
        )
    
    def check_suggestion(self, suggestion: str, facts_inventory: FactsInventory) -> RiskFlags:
        """Check suggestion against facts inventory and return risk flags"""
        new_skills = self._find_new_skills(suggestion, facts_inventory.skills)
        new_orgs = self._find_new_organizations(suggestion, facts_inventory.organizations)
        unverifiable_metrics = self._find_unverifiable_metrics(suggestion)
        
        return RiskFlags(
            new_skill=new_skills,
            new_org=new_orgs,
            unverifiable_metric=unverifiable_metrics
        )
    
    def _find_new_skills(self, text: str, existing_skills: List[str]) -> List[str]:
        """Find skills in text that are not in existing skills"""
        # Common skill patterns - more specific tech skills
        skill_patterns = [
            r'\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|Go|Rust|Swift|Kotlin|PHP|Ruby|Scala)\b',
            r'\b(?:React|Vue|Angular|Node\.js|Express|Django|Flask|Spring|Laravel|jQuery|Bootstrap)\b',
            r'\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|MongoDB|PostgreSQL|MySQL|Redis)\b',
            r'\b(?:Machine Learning|AI|Data Science|DevOps|Agile|Scrum|TensorFlow|PyTorch)\b',
            r'\b[A-Z][a-z]*(?:\.js|\.py|\.net|\.io|\.jsx|\.tsx)\b'  # Tech frameworks with extensions
        ]
        
        found_skills = set()
        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            found_skills.update(matches)
        
        # Check against existing skills with fuzzy matching
        new_skills = []
        for skill in found_skills:
            if not self._is_similar_to_existing(skill, existing_skills):
                new_skills.append(skill)
        
        return new_skills
    
    def _find_new_organizations(self, text: str, existing_orgs: List[str]) -> List[str]:
        """Find organizations in text that are not in existing organizations"""
        # Common company patterns - more specific
        org_patterns = [
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc|Corp|LLC|Ltd|Company|Technologies|Systems|Solutions|Group|Labs)\b',
            r'\b(?:Google|Microsoft|Apple|Amazon|Facebook|Meta|Netflix|Uber|Airbnb|Twitter|LinkedIn|GitHub|IBM|Oracle|Salesforce)\b',
            r'\b[A-Z]{3,}\b'  # Acronyms like IBM, NASA, etc. (at least 3 chars to avoid common words)
        ]
        
        found_orgs = set()
        for pattern in org_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            found_orgs.update(matches)
        
        # Check against existing organizations
        new_orgs = []
        for org in found_orgs:
            if not self._is_similar_to_existing(org, existing_orgs):
                new_orgs.append(org)
        
        return new_orgs
    
    def _find_unverifiable_metrics(self, text: str) -> List[str]:
        """Find metrics and claims that cannot be verified against resume data"""
        metric_patterns = [
            r'\b(?:increased|improved|reduced|decreased|grew|gained|achieved|delivered)\s+(?:by\s+)?\d+(?:%|percent|times|x)\b',
            r'\b(?:team of|group of|led|managed)\s+\d+\b',
            r'\b(?:served|reached|impacted|affected)\s+\d+(?:M|K|million|thousand)\b',
            r'\b(?:saved|reduced|cut)\s+\$?\d+(?:M|K|million|thousand)\b',
            r'\b(?:over|more than|less than|under|above)\s+\d+(?:M|K|million|thousand|years|months)\b'
        ]
        
        unverifiable_metrics = []
        for pattern in metric_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            unverifiable_metrics.extend(matches)
        
        return unverifiable_metrics
    
    def _is_similar_to_existing(self, item: str, existing_items: List[str]) -> bool:
        """Check if item is similar to any existing item using fuzzy matching"""
        item_lower = item.lower()
        for existing in existing_items:
            existing_lower = existing.lower()
            # Exact match
            if item_lower == existing_lower:
                return True
            # Check if one contains the other
            if item_lower in existing_lower or existing_lower in item_lower:
                return True
            # Fuzzy matching
            similarity = SequenceMatcher(None, item_lower, existing_lower).ratio()
            if similarity >= self.similarity_threshold:
                return True
        return False
