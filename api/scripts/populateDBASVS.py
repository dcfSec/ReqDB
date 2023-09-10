import json

from reqdb.extensions import db
from reqdb.models import Tag, Topic, Requirement, ExtraEntry, ExtraType


db.create_all()

with open("apit/scripts/asvs.json") as f:
    asvs = json.load(f)


l1 = Tag(name="Level 1")
l2 = Tag(name="Level 2")
l3 = Tag(name="Level 3")
tags = [l1, l2, l3]


nist = ExtraType(title="NIST Ref", extraType=1, description="NIST Reference")
cve = ExtraType(title="CVE Ref", extraType=1, description="CVE Reference")

root = Topic(key=asvs["ShortName"], title=asvs["Name"],
             description=asvs["Description"])


db.session.add_all(tags)
db.session.add_all([nist, cve])

db.session.add(root)

db.session.commit()

for itemL1 in asvs["Requirements"]:
    parentL1 = Topic(
        key=itemL1["Shortcode"],
        title=itemL1["ShortName"],
        description=itemL1["Name"],
        parent=root
    )
    db.session.add(parentL1)
    db.session.commit()
    for itemL2 in itemL1["Items"]:
        parentL2 = Topic(
            key=itemL2["Shortcode"],
            title=itemL2["Name"],
            description=itemL2["Name"],
            parent=parentL1
        )
        db.session.add(parentL2)
        db.session.commit()
        for itemL3 in itemL2["Items"]:
            t = []
            if itemL3["L1"]["Required"] is True:
                t.append(l1)
            if itemL3["L2"]["Required"] is True:
                t.append(l2)
            if itemL3["L3"]["Required"] is True:
                t.append(l3)
            requirement = Requirement(
                key=itemL3["Shortcode"],
                title=itemL3["Shortcode"] + " " + itemL2["Name"],
                description=itemL3["Description"],
                parent=parentL2,
                tags=t
            )
            db.session.add(requirement)
            db.session.commit()
            if itemL3["CWE"] != []:
                db.session.add(
                    ExtraEntry(
                        content="\n".join(str(n) for n in itemL3["CWE"]),
                        extraTypeId=cve.id, requirementId=requirement.id
                    )
                )
            if itemL3["NIST"] != []:
                db.session.add(
                    ExtraEntry(
                        content="\n".join(str(n) for n in itemL3["NIST"]),
                        extraTypeId=nist.id, requirementId=requirement.id
                    )
                )
            db.session.commit()

db.session.commit()
